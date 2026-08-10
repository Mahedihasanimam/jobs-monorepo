import asyncio
from scrapers.bpsc import BPSCScraper
import logging

logging.basicConfig(level=logging.INFO)

async def run():
    scraper = BPSCScraper()
    jobs = await scraper.scrape()
    for job in jobs:
        print(f"Title: {job.title}")
        print(f"Source URL: {job.source_url}")
        print(f"Circular URL: {job.circular_url}")
        print(f"Published Date: {job.published_date}")
        print("---")

asyncio.run(run())
