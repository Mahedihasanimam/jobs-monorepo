"""Extract structured, page-referenced requirements from circular PDFs.

Embedded text is preferred. Image-only pages are rendered and passed through
local Tesseract (Bengali + English) when the optional OCR dependencies exist.
"""
from __future__ import annotations

import asyncio
import hashlib
import re
from difflib import SequenceMatcher
from dataclasses import dataclass, field
from io import BytesIO
from typing import Optional

import httpx
from pypdf import PdfReader

from models.job import Job
from utils.date_parser import parse_date
from utils.logger import get_logger
from utils.job_notice import circular_looks_like_recruitment

logger = get_logger(__name__)
MAX_PAGES = 20
MIN_PAGE_TEXT = 45

LABELS = {
    "education": ("শিক্ষাগত যোগ্যতা", "শিক্ষাগত যোগ্যতাঃ", "educational qualification", "qualification"),
    "subject": ("বিষয়/বিভাগ", "বিষয়/বিভাগ", "বিষয়", "subject", "department"),
    "experience": ("অভিজ্ঞতা", "experience"),
    "age_requirement": ("বয়সসীমা", "বয়সসীমা", "প্রার্থীর বয়স", "প্রার্থীর বয়স", "age limit"),
    "gender_requirement": ("লিঙ্গ", "gender", "পুরুষ/মহিলা", "নারী/পুরুষ"),
    "quota_requirement": ("কোটা", "quota", "মুক্তিযোদ্ধা", "প্রতিবন্ধী"),
    "salary": ("বেতন স্কেল", "বেতনক্রম", "salary", "pay scale"),
    "application_fee": ("আবেদন ফি", "পরীক্ষার ফি", "application fee", "exam fee"),
    "location": ("কর্মস্থল", "কর্মস্থানের স্থান", "posting", "job location", "location"),
    "vacancies": ("পদ সংখ্যা", "পদসংখ্যা", "শূন্য পদের সংখ্যা", "vacanc", "number of posts"),
    "deadline": ("আবেদনের শেষ তারিখ", "আবেদনের শেষ সময়", "শেষ তারিখ", "deadline", "closing date", "last date"),
}
STOP_LABELS = tuple(label for labels in LABELS.values() for label in labels)
BN_DIGITS = str.maketrans("০১২৩৪৫৬৭৮৯", "0123456789")

@dataclass
class PDFExtraction:
    pages: list[str]
    method: str
    document_hash: str
    ocr_pages: list[int] = field(default_factory=list)

def _ocr_page(pdf_bytes: bytes, index: int) -> str:
    try:
        import pypdfium2 as pdfium
        import pytesseract
    except ImportError as error:
        raise RuntimeError("OCR packages missing; install pytesseract and pypdfium2") from error
    document = pdfium.PdfDocument(pdf_bytes)
    image = document[index].render(scale=2.5).to_pil()
    # Automatic page segmentation preserves mixed paragraphs and table columns
    # better than treating the entire circular as one uniform text block.
    return pytesseract.image_to_string(image, lang="ben+eng", config="--oem 1 --psm 4", timeout=90).strip()

def _text_quality(text: str) -> float:
    compact = re.sub(r"\s", "", text)
    if not compact:
        return 0
    meaningful = len(re.findall(r"[A-Za-z\u0980-\u09FF0-9]", compact))
    bengali = len(re.findall(r"[\u0980-\u09FF]", compact))
    # Government circulars may contain English, but Bengali PDFs whose font maps
    # to Latin gibberish need OCR even when extract_text() returns many bytes.
    language_bonus = 0.25 if bengali >= 20 else 0
    return min(1.0, meaningful / len(compact) + language_bonus)

def _looks_font_garbled(text: str) -> bool:
    """Detect common broken Bengali font-to-Unicode mappings from government PDFs."""
    markers = ("ননয় োগ", "আয়িেন", "বর্োগ্যতো", "নশক্ষোগত", "অনিজ্ঞতো", "প্রোথী", "বিতনয়েল", "ননম্নিনণডত")
    return sum(marker in text for marker in markers) >= 2

async def extract_pdf(url: str, timeout: int = 45) -> Optional[PDFExtraction]:
    try:
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
            response = await client.get(url, headers={"User-Agent": "GovtJobsBD/1.0"})
            response.raise_for_status()
            content = response.content
        if not content.startswith(b"%PDF"):
            logger.warning("Circular did not return a PDF: %s", url)
            return None
        reader = PdfReader(BytesIO(content))
        pages = [(page.extract_text() or "").strip() for page in reader.pages[:MAX_PAGES]]
        ocr_pages: list[int] = []
        for index, text in enumerate(pages):
            has_bengali = len(re.findall(r"[\u0980-\u09FF]", text)) >= 20
            readable_english = bool(re.search(r"\b(?:government|application|qualification|recruitment|circular)\b", text, re.I))
            if len(re.sub(r"\s", "", text)) >= MIN_PAGE_TEXT and _text_quality(text) >= .72 and (has_bengali or readable_english) and not _looks_font_garbled(text):
                continue
            try:
                ocr_text = await asyncio.to_thread(_ocr_page, content, index)
                if _text_quality(ocr_text) > _text_quality(text) or (_looks_font_garbled(text) and len(ocr_text) >= MIN_PAGE_TEXT) or not text:
                    pages[index] = ocr_text
                    ocr_pages.append(index + 1)
            except Exception as error:
                logger.warning("OCR unavailable for page %s of %s: %s", index + 1, url, error)
                break
        method = "ocr" if len(ocr_pages) == len(pages) else "hybrid" if ocr_pages else "embedded_text"
        return PDFExtraction(pages=pages, method=method, document_hash=hashlib.sha256(content).hexdigest(), ocr_pages=ocr_pages)
    except Exception as error:
        logger.warning("Could not extract circular %s: %s", url, error)
        return None

def _section(text: str, labels: tuple[str, ...], limit: int = 420) -> Optional[str]:
    lower = text.lower()
    hits = [(lower.find(label.lower()), label) for label in labels if lower.find(label.lower()) >= 0]
    if not hits:
        return None
    position, label = min(hits)
    start = position + len(label)
    end = min(len(text), start + limit)
    for stop in STOP_LABELS:
        next_pos = lower.find(stop.lower(), start + 8, end)
        if next_pos >= 0:
            end = min(end, next_pos)
    value = re.sub(r"\s+", " ", text[start:end]).strip(" :-–—।\n")
    return value or None

def _valid_value(key: str, value: str) -> bool:
    normalized = value.translate(BN_DIGITS)
    if len(value) < 2 or re.fullmatch(r"(?:page\s*)?\d+(?:\s*of\s*\d+)?", normalized.strip(), re.I):
        return False
    patterns = {
        "age_requirement": r"(?:\b(?:18|20|21|25|30|32|35|40|45|50|55|59)\b|বছর|বৎসর|year)",
        "salary": r"(?:\d[\d,.-]{2,}|টাকা|জাতীয় বেতন|জাতীয় বেতন|grade)",
        "application_fee": r"(?:\d[\d,.]*\s*(?:টাকা|tk)|টেলিটক|teletalk|payment)",
        "experience": r"(?:বছর|অভিজ্ঞতা|year|experience|প্রযোজ্য নয়|প্রযোজ্য নয়)",
        "education": r"(?:এসএসসি|এইচএসসি|স্নাতক|ডিগ্রি|ডিপ্লোমা|শিক্ষা|পাস|degree|diploma|graduate|ssc|hsc)",
        "vacancies": r"(?:\d|টি|জন|পদ)",
    }
    pattern = patterns.get(key)
    return not pattern or bool(re.search(pattern, normalized, re.I))

def parse_requirements(extraction: PDFExtraction) -> dict:
    values: dict = {}; confidence: dict[str, float] = {}; sources: dict[str, dict] = {}
    base_confidence = 0.92 if extraction.method == "embedded_text" else 0.76 if extraction.method == "hybrid" else 0.64
    for page_number, page in enumerate(extraction.pages, 1):
        for key, labels in LABELS.items():
            if key in values:
                continue
            value = _section(page, labels)
            if value and _valid_value(key, value):
                values[key] = value
                confidence[key] = base_confidence if page_number not in extraction.ocr_pages else min(base_confidence, 0.68)
                sources[key] = {"page": page_number, "excerpt": value[:240]}
    deadline_text = values.pop("deadline", None)
    if deadline_text:
        values["deadline"] = parse_date(deadline_text)
    vacancy_text = values.get("vacancies")
    if vacancy_text:
        match = re.search(r"\d+", vacancy_text.translate(BN_DIGITS))
        values["vacancies"] = int(match.group()) if match else None
    combined = " ".join(extraction.pages)
    fresher_pattern = r"freshers? (?:are )?(?:allowed|eligible)|অভিজ্ঞতা (?:প্রয়োজন|প্রয়োজন) নেই|অনভিজ্ঞ.*আবেদন"
    values["freshers_allowed"] = bool(re.search(fresher_pattern, combined, re.I))
    if values["freshers_allowed"]:
        confidence["freshers_allowed"] = base_confidence
    values["requirement_confidence"] = confidence
    values["requirement_sources"] = sources
    return values

def parse_position_requirements(extraction: PDFExtraction, title: str) -> dict:
    """Conservatively find one position's row in OCR table output."""
    def clean(value: str) -> str:
        value = value.translate(BN_DIGITS).lower().replace("সহায়ক", "সহায়ক")
        return re.sub(r"[^a-z0-9\u0980-\u09ff]+", " ", value).strip()
    target = clean(title)
    candidates: list[tuple[float, int, list[str]]] = []
    for page_number, page in enumerate(extraction.pages, 1):
        lines = [line.strip() for line in page.splitlines() if line.strip()]
        for index, line in enumerate(lines):
            normalized = clean(line)
            if not normalized:
                continue
            score = SequenceMatcher(None, target, normalized[:max(len(target) + 20, 30)]).ratio()
            if target in normalized:
                score = max(score, .95)
            candidates.append((score, page_number, lines[index:index + 5]))
    if not candidates:
        return {}
    score, page_number, lines = max(candidates, key=lambda item: item[0])
    if score < .58:
        return {}
    block_lines = [lines[0]]
    for line in lines[1:]:
        if re.match(r"^\s*[০-৯0-9]{1,2}[.)।\s]", line):
            break
        block_lines.append(line)
    block = re.sub(r"\s+", " ", " ".join(block_lines))
    result: dict = {"source": {"page": page_number, "excerpt": block[:240]}, "confidence": min(.78, .55 + score * .2)}
    education_start = re.search(r"(?:কোন\s+স্বীকৃত|অষ্টম\s+শ্রেণি|এসএসসি|এইচএসসি|স্নাতক|ডিপ্লোমা|ডিগ্রি|সমমান|উত্তীর্ণ)", block, re.I)
    if education_start:
        education = block[education_start.start():].strip()
        if _valid_value("education", education):
            result["education"] = education[:500]
    salary = re.search(r"\d{1,2}[,.]\d{3}\s*/?-?\s*[–—-]+\s*\d{1,2}[,.]\d{3}", block.translate(BN_DIGITS))
    if salary:
        result["salary"] = salary.group(0)
    return result

async def enrich_job_from_pdf(job: Job) -> Job:
    if not job.circular_url or ".pdf" not in job.circular_url.lower():
        return job
    extraction = await extract_pdf(job.circular_url)
    if not extraction:
        job.circular_processing_status = "failed"
        return job
    combined = "\n".join(extraction.pages)
    if job.source != "Teletalk AllJobs" and not circular_looks_like_recruitment(combined):
        job.circular_processing_status = "not_recruitment"
        job.is_active = False
        job.requirement_confidence = {}
        job.requirement_sources = {}
        for name in ("education", "subject", "experience", "age_requirement", "gender_requirement", "quota_requirement", "salary", "application_fee", "location", "vacancies", "freshers_allowed"):
            setattr(job, name, None)
        return job
    parsed = parse_requirements(extraction)
    position = parse_position_requirements(extraction, job.title)
    if position.get("education"):
        parsed["education"] = position["education"]
        parsed["requirement_confidence"]["education"] = position["confidence"]
        parsed["requirement_sources"]["education"] = position["source"]
    if position.get("salary"):
        parsed["salary"] = position["salary"]
        parsed["requirement_confidence"]["salary"] = position["confidence"]
        parsed["requirement_sources"]["salary"] = position["source"]
    for name in ("education", "subject", "experience", "age_requirement", "gender_requirement", "quota_requirement", "salary", "application_fee", "location", "vacancies", "freshers_allowed"):
        value = parsed.get(name)
        if getattr(job, name, None) is None:
            setattr(job, name, value)
    if parsed.get("deadline") is not None:
        job.deadline = parsed["deadline"]
    job.requirement_confidence = parsed["requirement_confidence"]
    job.requirement_sources = parsed["requirement_sources"]
    job.circular_text = "\n\n".join(f"[Page {i}]\n{text}" for i, text in enumerate(extraction.pages, 1))[:100_000]
    job.circular_document_hash = extraction.document_hash
    job.circular_extraction_method = extraction.method
    job.circular_processing_status = "processed"
    return job
