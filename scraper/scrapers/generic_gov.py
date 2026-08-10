from bs4 import BeautifulSoup
from typing import List, Optional, Dict, Any
from models.job import Job
from scrapers.base import BaseScraper
from utils.logger import get_logger
from utils.date_parser import parse_date
from utils.url import normalize_url
from utils.text import safe_extract
import re

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

    def _is_job_notice(self, title: str) -> bool:
        """Heuristic to check if a notice is a job circular."""
        title_lower = title.lower()
        return any(keyword in title_lower for keyword in self.job_keywords)

    async def scrape(self) -> List[Job]:
        jobs = []
        logger.info(f"[{self.name}] Starting scrape from {self.listing_url}")
        
        soup = await self.get_soup(self.listing_url)
        if not soup:
            return jobs
            
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
            
        return Job(
            title=title_text,
            organization=self.organization,
            source=self.name,
            source_url=circular_url, # Now uses unique circular url
            circular_url=circular_url,
            published_date=published_date,
            is_active=True
        )
