import re
from bs4 import BeautifulSoup
from typing import List, Optional
from models.job import Job
from scrapers.base import BaseScraper
from utils.logger import get_logger
from utils.date_parser import parse_date
from utils.url import normalize_url
from utils.text import safe_extract

logger = get_logger(__name__)

class TeletalkScraper(BaseScraper):
    """
    Scraper for alljobs.teletalk.com.bd which lists many government IT jobs
    and centralized recruitment portals.
    """
    def __init__(self):
        super().__init__()
        self.name = "Teletalk AllJobs"
        self.base_url = "https://alljobs.teletalk.com.bd"
        self.listing_url = "https://alljobs.teletalk.com.bd/en/jobs"

    async def scrape(self) -> List[Job]:
        jobs = []
        logger.info(f"[{self.name}] Starting scrape from {self.listing_url}")
        
        soup = await self.get_soup(self.listing_url)
        if not soup:
            return jobs
            
        # Teletalk alljobs often lists jobs in class="single-job" or similar list items
        # Structure verification needed, assuming standard "job-list" container
        job_cards = soup.select('.single-job')
        
        # If no cards, try alternative selectors
        if not job_cards:
            job_cards = soup.select('.job-list-item')
            
        for card in job_cards:
            try:
                job = await self.parse_job(card)
                if job:
                    jobs.append(job)
            except Exception as e:
                logger.error(f"[{self.name}] Error parsing job card: {e}")
                
        return jobs

    async def parse_job(self, card: BeautifulSoup) -> Optional[Job]:
        title_el = card.select_one('.job-title, h4')
        if not title_el:
            return None
            
        title = safe_extract(title_el)
        if not title:
            return None
            
        # Organization
        org_el = card.select_one('.company-name, .org-name')
        organization = safe_extract(org_el) or "Teletalk Client"
        
        # Dates
        deadline_el = card.select_one('.deadline, .end-date')
        deadline_text = safe_extract(deadline_el)
        deadline = parse_date(deadline_text) if deadline_text else None
        
        # Link
        link_el = card.select_one('a')
        source_url = self.listing_url
        if link_el and link_el.get('href'):
            source_url = normalize_url(self.base_url, link_el.get('href'))
            
        return Job(
            title=title,
            organization=organization,
            source=self.name,
            source_url=source_url,
            apply_url=source_url,
            deadline=deadline,
            is_active=True
        )
