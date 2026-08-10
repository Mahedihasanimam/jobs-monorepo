import re
from typing import Optional

def clean_text(text: Optional[str]) -> Optional[str]:
    """
    Cleans up HTML whitespace, newlines, and normalizes spaces.
    Keeps Unicode (Bengali) text intact.
    """
    if not text:
        return None
        
    # Replace common HTML entities/whitespace variants
    text = text.replace('\xa0', ' ')
    text = text.replace('\r\n', '\n')
    
    # Strip leading/trailing whitespace
    text = text.strip()
    
    # Remove multiple spaces/newlines where not needed
    # But preserve intended multi-line formatting if useful
    # For now, just collapse multiple spaces to a single space
    text = re.sub(r' +', ' ', text)
    
    if not text:
        return None
        
    return text

def safe_extract(soup_element, default=None) -> Optional[str]:
    """Safely extract text from a BeautifulSoup element."""
    if soup_element:
        return clean_text(soup_element.get_text())
    return default
