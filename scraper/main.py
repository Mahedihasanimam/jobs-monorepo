import argparse
import asyncio
import os
import sys
from dotenv import load_dotenv
from utils.logger import get_logger
from services.supabase_service import SupabaseJobService
from services.pdf_enrichment import enrich_job_from_pdf

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

async def run_scraper(scraper_id: str, dry_run: bool, supabase_service: SupabaseJobService, process_pdfs: bool = True):
    """Runs a single scraper and stores the results."""
    
    scraper_class = SCRAPER_REGISTRY.get(scraper_id)
    if not scraper_class:
        logger.error(f"Scraper '{scraper_id}' not found.")
        return 0, 0, 0
        
    scraper = scraper_class()
    logger.info(f"Starting {scraper.name} scraper...")
    
    try:
        raw_jobs = await scraper.scrape()
        fetched_count = len(raw_jobs)
        
        if fetched_count == 0:
            logger.warning(f"[{scraper.name}] No jobs fetched.")
            if hasattr(scraper, "scrape_exam_notices"):
                exam_notices = await scraper.scrape_exam_notices()
                supabase_service.upsert_exam_notices(exam_notices, dry_run=dry_run)
            return 0, 0, 0
            
        # Deduplicate by (source, source_url)
        unique_jobs = {}
        for job in raw_jobs:
            key = (job.source, job.source_url)
            if key not in unique_jobs:
                unique_jobs[key] = job
                
        jobs = list(unique_jobs.values())
        deduped_count = len(jobs)

        if process_pdfs:
            existing_jobs = supabase_service.get_existing_jobs_by_source(scraper.name)
            
            jobs_to_process = []
            for job in jobs:
                existing = existing_jobs.get(job.source_url)
                if existing and existing.get("circular_processing_status"):
                    # Restore the PDF extracted fields from DB so we don't overwrite with None on upsert
                    for field in ["education", "subject", "experience", "age_requirement", "gender_requirement", 
                                  "quota_requirement", "salary", "application_fee", "location", "vacancies", 
                                  "freshers_allowed", "circular_text", "circular_document_hash", 
                                  "circular_extraction_method", "circular_processing_status",
                                  "requirement_confidence", "requirement_sources"]:
                        if field in existing and existing[field] is not None:
                            setattr(job, field, existing[field])
                elif job.circular_url:
                    jobs_to_process.append(job)

            if jobs_to_process:
                concurrency = max(1, int(os.environ.get("PDF_PROCESSING_CONCURRENCY", "10")))
                semaphore = asyncio.Semaphore(concurrency)
                async def enrich(job):
                    async with semaphore:
                        return await enrich_job_from_pdf(job)
                logger.info(f"[{scraper.name}] Extracting circular requirements from {len(jobs_to_process)} NEW document(s)...")
                await asyncio.gather(*(enrich(job) for job in jobs_to_process))
            else:
                logger.info(f"[{scraper.name}] All {sum(bool(job.circular_url) for job in jobs)} document(s) already processed. Skipping extraction.")
            
            rejected = sum(job.circular_processing_status == "not_recruitment" for job in jobs)
            if rejected:
                logger.warning(f"[{scraper.name}] Rejected {rejected} document(s) that did not contain recruitment requirements.")
            jobs = [job for job in jobs if job.circular_processing_status != "not_recruitment"]
        
        logger.info(f"[{scraper.name}] Fetched {fetched_count} jobs. After deduplication: {deduped_count} jobs.")
        
        for job in jobs:
            logger.info(f"--- Job Extracted ---")
            logger.info(f"Title: {job.title}")
            logger.info(f"Source URL: {job.source_url}")
            logger.info(f"Circular URL: {job.circular_url}")
            logger.info(f"Published Date: {job.published_date}")
            logger.info(f"Fingerprint: {job.generate_fingerprint()}")
            
        logger.info(f"[{scraper.name}] Upserting {deduped_count} jobs to Supabase...")
        new_count, updated_count = supabase_service.upsert_jobs(jobs, dry_run=dry_run)
        if hasattr(scraper, "scrape_exam_notices"):
            exam_notices = await scraper.scrape_exam_notices()
            exam_count = supabase_service.upsert_exam_notices(exam_notices, dry_run=dry_run)
            logger.info(f"[{scraper.name}] Upserted {exam_count} exam/admit notices.")
        
        return fetched_count, new_count, updated_count
        
    except Exception as e:
        logger.exception(f"[{scraper.name}] Scraper failed: {e}")
        return 0, 0, 0

async def main():
    parser = argparse.ArgumentParser(description="Bangladesh Government Job Scraper")
    parser.add_argument("--source", nargs="+", choices=SCRAPER_REGISTRY.keys(), help="Specific sources to scrape")
    parser.add_argument("--dry-run", action="store_true", help="Run without saving to database")
    parser.add_argument("--skip-pdf", action="store_true", help="Skip circular PDF extraction/OCR")
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
        fetched, new, updated = await run_scraper(source, args.dry_run, supabase, process_pdfs=not args.skip_pdf)
        total_fetched += fetched
        total_new += new
        total_updated += updated
        
    logger.info("Scraping completed.")
    logger.info(f"Total Fetched: {total_fetched}")
    logger.info(f"Total Upserted: {total_new + total_updated}")
    
    if not args.dry_run:
        supabase.quarantine_non_recruitment_jobs(dry_run=False)
        supabase.mark_expired_jobs(dry_run=False)
        supabase.mark_expired_exam_notices(dry_run=False)

if __name__ == "__main__":
    asyncio.run(main())
