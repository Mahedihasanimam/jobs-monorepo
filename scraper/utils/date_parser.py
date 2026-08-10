import re
from datetime import datetime, date
from typing import Optional
from utils.logger import get_logger

logger = get_logger(__name__)

BENGALI_TO_ENGLISH_DIGITS = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
}

BENGALI_MONTHS = {
    'জানুয়ারি': '01', 'ফেব্রুয়ারি': '02', 'মার্চ': '03', 'এপ্রিল': '04',
    'মে': '05', 'জুন': '06', 'জুলাই': '07', 'আগস্ট': '08', 'আগষ্ট': '08',
    'সেপ্টেম্বর': '09', 'অক্টোবর': '10', 'নভেম্বর': '11', 'ডিসেম্বর': '12'
}

ENGLISH_MONTHS_SHORT = {
    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
    'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
    'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
}

def convert_bengali_digits(text: str) -> str:
    """Converts Bengali digits to English digits."""
    for bn, en in BENGALI_TO_ENGLISH_DIGITS.items():
        text = text.replace(bn, en)
    return text

def parse_date(date_str: Optional[str]) -> Optional[date]:
    """
    Parses various date formats commonly found in BD Gov websites.
    Supports Bengali numerals, Bengali months, and common English formats.
    """
    if not date_str:
        return None
        
    date_str = date_str.strip().lower()
    
    # Clean up common date prefixes if present
    date_str = re.sub(r'^(published on|date:|তারিখ:)\s*', '', date_str, flags=re.IGNORECASE).strip()
    
    # Convert Bengali digits
    date_str = convert_bengali_digits(date_str)
    
    # 1. ISO Format (YYYY-MM-DD)
    iso_match = re.search(r'(\d{4})-(\d{2})-(\d{2})', date_str)
    if iso_match:
        try:
            return date(int(iso_match.group(1)), int(iso_match.group(2)), int(iso_match.group(3)))
        except ValueError:
            pass

    # 2. DD/MM/YYYY or DD-MM-YYYY
    dmy_match = re.search(r'(\d{1,2})[/-](\d{1,2})[/-](\d{4})', date_str)
    if dmy_match:
        try:
            return date(int(dmy_match.group(3)), int(dmy_match.group(2)), int(dmy_match.group(1)))
        except ValueError:
            pass
            
    # 3. Bengali Text Date (e.g., ১০ আগস্ট ২০২৬)
    # Convert Bengali month names to numbers
    for bn_month, month_num in BENGALI_MONTHS.items():
        if bn_month in date_str:
            date_str = date_str.replace(bn_month, f"-{month_num}-")
            # Cleanup multiple dashes if any
            date_str = re.sub(r'-+', '-', date_str)
            break
            
    # 4. English Text Date (e.g., 10 August 2026 or 10-Aug-2026)
    for en_month, month_num in ENGLISH_MONTHS_SHORT.items():
        if en_month in date_str:
            # We match the first 3 letters for English month
            date_str = re.sub(en_month + r'[a-z]*', f"-{month_num}-", date_str)
            date_str = re.sub(r'-+', '-', date_str)
            break
            
    # Clean any spaces around dashes and parse again as DD-MM-YYYY
    date_str = re.sub(r'\s+', '-', date_str)
    date_str = re.sub(r'-+', '-', date_str)
    dmy_match = re.search(r'(\d{1,2})-(\d{1,2})-(\d{4})', date_str)
    
    if dmy_match:
        try:
            return date(int(dmy_match.group(3)), int(dmy_match.group(2)), int(dmy_match.group(1)))
        except ValueError:
            pass

    logger.warning(f"Failed to parse date: {date_str}")
    return None
