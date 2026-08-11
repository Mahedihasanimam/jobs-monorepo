"""Conservative classification for active recruitment circulars."""
import re

EXCLUDED = (
    "ফলাফল", "উত্তীর্ণ", "অপেক্ষমাণ", "অপেক্ষমান", "নব-নিয়োগপ্রাপ্ত", "নবনিয়োগপ্রাপ্ত",
    "যোগদান", "পদায়ন", "পদায়ন", "দপ্তরাদেশ", "নিয়োগ প্রদান", "নিয়োগ প্রদান",
    "পরীক্ষার সময়সূচি", "পরীক্ষার সময়সূচি", "লিখিত পরীক্ষা", "মৌখিক পরীক্ষা",
    "প্রবেশপত্র", "আসন বিন্যাস", "স্থগিত", "হালনাগাদ তথ্য", "শুন্য পদের হালনাগাদ",
    "চূড়ান্তভাবে নির্বাচিত", "নিয়োগপত্র", "নিয়োগপত্র", "waiting list", "result", "exam schedule",
    "appointment", "joining", "posting order", "selected candidate",
)
POSITIVE = (
    "নিয়োগ বিজ্ঞপ্তি", "নিয়োগ বিজ্ঞপ্তি", "নিয়োগের লক্ষ্যে", "নিয়োগের লক্ষ্যে",
    "জনবল নিয়োগ", "জনবল নিয়োগ", "দরখাস্ত আহবান", "দরখাস্ত আহ্বান", "আবেদন আহবান",
    "আবেদন আহ্বান", "job circular", "recruitment circular", "applications are invited", "vacancy announcement",
)

def is_recruitment_notice(title: str) -> bool:
    value = re.sub(r"\s+", " ", title).strip().lower()
    if any(term in value for term in EXCLUDED):
        return False
    return any(term in value for term in POSITIVE)

def circular_looks_like_recruitment(text: str) -> bool:
    value = re.sub(r"\s+", " ", text).lower()
    application = any(term in value for term in ("আবেদন", "দরখাস্ত", "apply online", "application"))
    qualification = any(term in value for term in ("যোগ্যতা", "শিক্ষাগত", "বয়সসীমা", "বয়সসীমা", "qualification", "age limit"))
    closing = any(term in value for term in ("শেষ তারিখ", "শেষ সময়", "আবেদনের সময়সীমা", "deadline", "closing date"))
    return application and qualification and closing
