import httpx
from bs4 import BeautifulSoup
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
import os
import asyncio
from typing import List, Optional, Any
from models.job import Job
from utils.logger import get_logger

logger = get_logger(__name__)

class ScraperError(Exception):
    pass

class BaseScraper:
    name: str = "BaseScraper"
    base_url: str = ""
    
    def __init__(self):
        self.timeout = int(os.environ.get("REQUEST_TIMEOUT", "30"))
        self.max_pages = int(os.environ.get("MAX_PAGES_PER_SOURCE", "5"))
        self.delay = int(os.environ.get("REQUEST_DELAY", "1"))
        
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
        }
        
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10),
        retry=retry_if_exception_type((httpx.RequestError, httpx.HTTPStatusError)),
        reraise=True
    )
    async def fetch(self, url: str) -> Optional[str]:
        """
        Fetches a URL with retries for network and 5xx errors.
        Does not retry 4xx errors (except 429 if configured, but standard is fine).
        """
        async with httpx.AsyncClient(timeout=self.timeout, headers=self.headers) as client:
            try:
                response = await client.get(url, follow_redirects=True)
                response.raise_for_status()
                return response.text
            except httpx.HTTPStatusError as e:
                # Do not retry 4xx errors
                if 400 <= e.response.status_code < 500:
                    logger.error(f"Client error {e.response.status_code} for {url}. Not retrying.")
                    return None
                logger.warning(f"HTTP error for {url}: {e}")
                raise
            except httpx.RequestError as e:
                logger.warning(f"Request error for {url}: {e}")
                raise

    async def get_soup(self, url: str) -> Optional[BeautifulSoup]:
        """Fetches URL and returns BeautifulSoup object."""
        html = await self.fetch(url)
        if html:
            return BeautifulSoup(html, "html.parser")
        return None

    async def scrape(self) -> List[Job]:
        """
        Main entry point for the scraper.
        Must be implemented by child classes.
        """
        raise NotImplementedError("Child classes must implement scrape()")

    async def parse_job(self, item: Any) -> Optional[Job]:
        """
        Parses a single job item.
        Must be implemented by child classes.
        """
        raise NotImplementedError("Child classes must implement parse_job()")
        
    async def delay_request(self):
        """Adds a small delay between requests."""
        await asyncio.sleep(self.delay)
