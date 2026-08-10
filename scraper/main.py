import argparse
import asyncio
import sys
from dotenv import load_dotenv
from utils.logger import get_logger
from services.supabase_service import SupabaseJobService

from scrapers.bpsc import BPSCScraper
from scrapers.teletalk import TeletalkScraper
from scrapers.railway import RailwayScraper
from scrapers.health import HealthScraper
from scrapers.education import EducationScraper

# Load environment variables
load_dotenv()
logger = get_logger(__name__)

SCRAPER_REGISTRY = {
    "bpsc": BPSCScraper,
    "teletalk": TeletalkScraper,
    "railway": RailwayScraper,
    "health": HealthScraper,
    "education": EducationScraper
}

async def run_scraper(scraper_id: str, dry_run: bool, supabase_service: SupabaseJobService):
    """Runs a single scraper and stores the results."""
    
    scraper_class = SCRAPER_REGISTRY.get(scraper_id)
    if not scraper_class:
        logger.error(f"Scraper '{scraper_id}' not found.")
        return 0, 0, 0
        
    scraper = scraper_class()
    logger.info(f"Starting {scraper.name} scraper...")
    
    try:
        jobs = await scraper.scrape()
        fetched_count = len(jobs)
        
        if fetched_count == 0:
            logger.warning(f"[{scraper.name}] No jobs fetched.")
            return 0, 0, 0
            
        logger.info(f"[{scraper.name}] Fetched {fetched_count} jobs. Upserting to Supabase...")
        new_count, updated_count = supabase_service.upsert_jobs(jobs, dry_run=dry_run)
        
        return fetched_count, new_count, updated_count
        
    except Exception as e:
        logger.exception(f"[{scraper.name}] Scraper failed: {e}")
        return 0, 0, 0

async def main():
    parser = argparse.ArgumentParser(description="Bangladesh Government Job Scraper")
    parser.add_argument("--source", nargs="+", choices=SCRAPER_REGISTRY.keys(), help="Specific sources to scrape")
    parser.add_argument("--dry-run", action="store_true", help="Run without saving to database")
    args = parser.parse_args()
    
    supabase = SupabaseJobService()
    if not args.dry_run and not supabase.is_configured():
        logger.error("Supabase is not configured and not in dry-run mode. Exiting.")
        sys.exit(1)
        
    sources = args.source if args.source else SCRAPER_REGISTRY.keys()
    logger.info(f"Starting scraper for sources: {', '.join(sources)}")
    
    total_fetched = 0
    total_new = 0
    total_updated = 0
    
    for source in sources:
        fetched, new, updated = await run_scraper(source, args.dry_run, supabase)
        total_fetched += fetched
        total_new += new
        total_updated += updated
        
    logger.info("Scraping completed.")
    logger.info(f"Total Fetched: {total_fetched}")
    logger.info(f"Total Upserted: {total_new + total_updated}")
    
    if not args.dry_run:
        supabase.mark_expired_jobs(dry_run=False)

if __name__ == "__main__":
    asyncio.run(main())
