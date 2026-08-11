from bs4 import BeautifulSoup
from typing import List, Optional, Dict, Any
from models.job import Job
from models.exam_notice import ExamNotice
from scrapers.base import BaseScraper
from utils.logger import get_logger
from utils.date_parser import parse_date
from utils.url import normalize_url
from utils.text import safe_extract
import re
from datetime import date
from io import BytesIO
from utils.job_notice import is_recruitment_notice

logger = get_logger(__name__)

class GenericGovScraper(BaseScraper):
    """
    A configurable scraper for Bangladesh National Web Portal sites.
    Many BD gov sites share a similar table structure for notices.
    """
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__()
        self.name = config.get("name", "Generic Gov Scraper")
        self.base_url = config.get("base_url", "")
        self.listing_url = config.get("listing_url", f"{self.base_url}/site/view/notices")
        self.organization = config.get("organization", self.name)
        self.category = config.get("category")
        self.organization_logo_url = config.get("organization_logo_url")
        self._listing_soup = None
        
        # Selectors (with defaults based on common National Web Portal structure)
        self.table_selector = config.get("table_selector", "table")
        self.row_selector = config.get("row_selector", "tr")
        self.title_col_idx = config.get("title_col_idx", 1) # usually second column
        self.date_col_idx = config.get("date_col_idx", 2) # usually third column
        self.link_selector = config.get("link_selector", "a")
        
        # Filter keywords to distinguish jobs from other notices
        self.job_keywords = [
            'নিয়োগ', 'নিয়োগ', 'চাকরি', 'পদের',
            'recruitment', 'job circular', 'vacancy', 'career'
        ]
        self.exam_keywords = ('পরীক্ষা', 'প্রবেশপত্র', 'এডমিট', 'ফলাফল', 'exam schedule', 'admit card', 'written test', 'viva', 'result')

    def _is_job_notice(self, title: str) -> bool:
        """Heuristic to check if a notice is a job circular."""
        return is_recruitment_notice(title)

    async def scrape(self) -> List[Job]:
        jobs = []
        logger.info(f"[{self.name}] Starting scrape from {self.listing_url}")
        
        soup = await self.get_soup(self.listing_url)
        if not soup:
            return jobs
        self._listing_soup = soup
        self.organization_logo_url = self.organization_logo_url or self.extract_organization_logo(soup)
            
        table = soup.select_one(self.table_selector)
        if not table:
            logger.warning(f"[{self.name}] Table not found on {self.listing_url}")
            return jobs
            
        rows = table.select(self.row_selector)
        
        for row in rows:
            try:
                job = await self.parse_job(row)
                if job:
                    jobs.append(job)
            except Exception as e:
                logger.error(f"[{self.name}] Error parsing row: {e}")
                
        return jobs

    async def scrape_exam_notices(self) -> List[ExamNotice]:
        soup = self._listing_soup or await self.get_soup(self.listing_url)
        if not soup: return []
        self.organization_logo_url = self.organization_logo_url or self.extract_organization_logo(soup)
        table = soup.select_one(self.table_selector)
        if not table: return []
        notices = []
        for row in table.select(self.row_selector):
            cols = row.find_all(['td', 'th'])
            if len(cols) < max(self.title_col_idx, self.date_col_idx) + 1: continue
            title_col = cols[self.title_col_idx]
            title = safe_extract(title_col)
            if not title or not any(word in title.lower() for word in self.exam_keywords): continue
            link = title_col.select_one(self.link_selector) or cols[-1].select_one(self.link_selector)
            if not link or not link.get('href'): continue
            source_url = normalize_url(self.base_url, link.get('href'))
            if not source_url: continue
            notice_type = 'admit_card' if any(word in title.lower() for word in ('প্রবেশপত্র', 'এডমিট', 'admit card')) else 'result' if any(word in title.lower() for word in ('ফলাফল', 'result')) else 'exam_schedule'
            published = parse_date(safe_extract(cols[self.date_col_idx]))
            circular_url = source_url
            exam_date = None
            if not re.search(r'\.pdf(?:$|\?)', source_url, flags=re.IGNORECASE):
                detail = await self.get_soup(source_url)
                if detail:
                    text = detail.get_text(' ', strip=True)
                    exam_date = self._date_after_label(text, ('পরীক্ষার তারিখ', 'পরীক্ষা অনুষ্ঠিত', 'exam date', 'test date'))
                    pdf = detail.select_one('a[href$=".pdf" i], a[href*=".pdf?" i]')
                    if pdf and pdf.get('href'): circular_url = normalize_url(self.base_url, pdf.get('href')) or source_url
            notices.append(ExamNotice(title=title, organization=self.organization, organization_logo_url=self.organization_logo_url, notice_type=notice_type, published_date=published, exam_date=exam_date, source=self.name, source_url=source_url, circular_url=circular_url))
        return notices

    async def parse_job(self, row: BeautifulSoup) -> Optional[Job]:
        cols = row.find_all(['td', 'th'])
        if len(cols) < max(self.title_col_idx, self.date_col_idx) + 1:
            return None
            
        title_col = cols[self.title_col_idx]
        title_text = safe_extract(title_col)
        
        if not title_text or not self._is_job_notice(title_text):
            return None
            
        date_text = safe_extract(cols[self.date_col_idx])
        published_date = parse_date(date_text)
        
        link_el = title_col.select_one(self.link_selector)
        if not link_el or not link_el.get('href'):
            # Sometimes the link is in the next column for downloading PDF
            pdf_col = cols[-1]
            link_el = pdf_col.select_one(self.link_selector)
            
        circular_url = None
        if link_el and link_el.get('href'):
            circular_url = normalize_url(self.base_url, link_el.get('href'))
            
        if not circular_url:
            return None
        notice_url = circular_url

        deadline = None
        education = experience = age_requirement = salary = None
        # National Portal rows commonly link to a notice-details page. Enrich the
        # record from that page and resolve its actual downloadable PDF.
        if not re.search(r'\.pdf(?:$|\?)', circular_url, flags=re.IGNORECASE):
            detail_soup = await self.get_soup(circular_url)
            if detail_soup:
                detail_text = detail_soup.get_text(' ', strip=True)
                published_date = published_date or self._date_after_label(detail_text, ('প্রকাশের তারিখ', 'প্রকাশিত', 'published'))
                deadline = self._date_after_label(detail_text, ('আবেদনের শেষ তারিখ', 'আবেদনের শেষ সময়', 'শেষ তারিখ', 'deadline', 'closing date'))
                pdf_link = detail_soup.select_one('.notice-details a[href$=".pdf" i], .notice-content a[href$=".pdf" i], article a[href$=".pdf" i], main a[href$=".pdf" i], a[download][href*=".pdf" i]')
                if not pdf_link:
                    all_pdf_links = detail_soup.select('a[href$=".pdf" i], a[href*=".pdf?" i]')
                    if len(all_pdf_links) == 1:
                        pdf_link = all_pdf_links[0]
                if pdf_link and pdf_link.get('href'):
                    circular_url = normalize_url(self.base_url, pdf_link.get('href')) or circular_url
        return Job(
            title=title_text,
            organization=self.organization,
            category=self.category,
            organization_logo_url=self.organization_logo_url,
            source=self.name,
            source_url=notice_url,
            circular_url=circular_url,
            published_date=published_date,
            deadline=deadline,
            education=education,
            experience=experience,
            age_requirement=age_requirement,
            salary=salary,
            is_active=True
        )

    @staticmethod
    def _date_after_label(text: str, labels: tuple[str, ...]) -> Optional[date]:
        lower = text.lower()
        for label in labels:
            position = lower.find(label.lower())
            if position >= 0:
                parsed = parse_date(text[position:position + 90])
                if parsed:
                    return parsed
        return None

    @staticmethod
    def _section_after_labels(text: str, labels: tuple[str, ...], limit: int = 500) -> Optional[str]:
        lower = text.lower()
        for label in labels:
            position = lower.find(label.lower())
            if position >= 0:
                section = re.sub(r'\s+', ' ', text[position + len(label):position + len(label) + limit]).strip(' :-–—।')
                if section: return section
        return None

    async def _text_from_pdf(self, url: str) -> Optional[str]:
        """Read text-based circular PDFs; scanned image-only PDFs remain unset."""
        try:
            from pypdf import PdfReader
            content = await self.fetch_bytes(url)
            if not content:
                return None
            reader = PdfReader(BytesIO(content))
            text = ' '.join((page.extract_text() or '') for page in reader.pages[:12])
            return text.strip() or None
        except Exception as error:
            logger.warning(f"[{self.name}] Could not read circular PDF dates from {url}: {error}")
            return None
