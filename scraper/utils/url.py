from urllib.parse import urljoin, urlparse, urlunparse
from typing import Optional

def normalize_url(base_url: str, url: Optional[str]) -> Optional[str]:
    """
    Normalizes a URL by converting relative to absolute,
    and stripping common tracking parameters or fragments.
    """
    if not url:
        return None
        
    # Convert relative to absolute
    absolute_url = urljoin(base_url, url)
    
    # Parse URL to clean it
    parsed = urlparse(absolute_url)
    
    # Reconstruct without fragments
    clean_url = urlunparse((
        parsed.scheme,
        parsed.netloc,
        parsed.path,
        parsed.params,
        parsed.query,
        "" # Remove fragment
    ))
    
    return clean_url
