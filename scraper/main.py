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
        return 0, [], 0
        
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
            return 0, [], 0
            
        # Deduplicate by (source, source_url)
        unique_jobs = {}
        for job in raw_jobs:
            key = (job.source, job.source_url)
            if key not in unique_jobs:
                unique_jobs[key] = job
                
        jobs = list(unique_jobs.values())
        deduped_count = len(jobs)
        
        # Calculate truly new jobs
        existing_jobs = supabase_service.get_existing_jobs_by_source(scraper.name)
        new_jobs = [job for job in jobs if job.source_url not in existing_jobs]

        if process_pdfs:
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
        _, updated_count = supabase_service.upsert_jobs(jobs, dry_run=dry_run)
        if hasattr(scraper, "scrape_exam_notices"):
            exam_notices = await scraper.scrape_exam_notices()
            exam_count = supabase_service.upsert_exam_notices(exam_notices, dry_run=dry_run)
            logger.info(f"[{scraper.name}] Upserted {exam_count} exam/admit notices.")
        
        return fetched_count, new_jobs, deduped_count - len(new_jobs)
        
    except Exception as e:
        logger.exception(f"[{scraper.name}] Scraper failed: {e}")
        return 0, [], 0

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
    all_new_jobs = []
    total_updated = 0
    
    for source in sources:
        fetched, new_jobs_from_source, updated = await run_scraper(source, args.dry_run, supabase, process_pdfs=not args.skip_pdf)
        total_fetched += fetched
        all_new_jobs.extend(new_jobs_from_source)
        total_updated += updated
        
    logger.info("Scraping completed.")
    logger.info(f"Total Fetched: {total_fetched}")
    logger.info(f"Total New Jobs: {len(all_new_jobs)}")
    logger.info(f"Total Updated: {total_updated}")
    
    if not args.dry_run:
        supabase.quarantine_non_recruitment_jobs(dry_run=False)
        supabase.mark_expired_jobs(dry_run=False)
        supabase.mark_expired_exam_notices(dry_run=False)
        
        # Send push notifications for new jobs
        total_new = len(all_new_jobs)
        if total_new > 0:
            logger.info(f"Triggering push notifications for {total_new} new jobs...")
            import random
            from services.notification_service import send_expo_push_notifications
            
            tokens = supabase.get_all_device_tokens()
            if tokens:
                # If there are only a few new jobs, notify specifically for each (like deadline notifier)
                if total_new <= 5:
                    templates = [
                        {
                            "title": "🇧🇩 সরকারি চাকরির স্বপ্ন পূরণের সুযোগ! {title}-এ বিশাল নিয়োগ।",
                            "body": "আপনার একটি সঠিক সিদ্ধান্ত আর আবেদন বদলে দিতে পারে আপনার ভবিষ্যত। দেরি না করে এখনি বিস্তারিত জানুন!"
                        },
                        {
                            "title": "🇧🇩 আপনার জীবনের মোড় ঘুরতে পারে! {title}-এর নতুন সার্কুলার প্রকাশ।",
                            "body": "সময় ফুরিয়ে যাওয়ার আগেই নিজের যোগ্যতা যাচাই করে আবেদন করে ফেলুন। হয়তো এটাই আপনার কাঙ্ক্ষিত চাকরি!"
                        },
                        {
                            "title": "🇧🇩 বেকারত্ব ঘোচানোর সেরা সুযোগ! {title}-এর বিজ্ঞপ্তি মিস করবেন না।",
                            "body": "হাজারো প্রার্থীর ভিড়ে নিজেকে প্রমাণ করার এটাই সুযোগ। এক ক্লিকেই জেনে নিন আবেদনের সব নিয়মকানুন।"
                        },
                        {
                            "title": "🇧🇩 ক্যারিয়ার গড়ার মোক্ষম সময়! {title}-এর বিজ্ঞপ্তিটি আপনার জন্য।",
                            "body": "একটি আবেদনই হতে পারে আপনার সফলতার চাবিকাঠি! এখনই অ্যাপে ঢুকে বিস্তারিত দেখে নিন।"
                        }
                    ]
                    
                    for job in all_new_jobs:
                        template = random.choice(templates)
                        org_name = job.organization or "নতুন প্রতিষ্ঠান"
                        job_title = job.title or "নতুন পদ"
                        # Use organization name if available, else job title for a cleaner hook
                        display_name = org_name if job.organization else job_title
                        
                        title = template["title"].format(title=display_name)
                        body = template["body"]
                        await send_expo_push_notifications(tokens, title, body, data={"type": "new_job", "job_title": job_title})
                else:
                    # If there are many jobs, send a grouped notification mentioning one or two to avoid spam
                    sample_job = all_new_jobs[0]
                    display_name = sample_job.organization or sample_job.title or "নতুন"
                    
                    titles = [
                        f"🇧🇩 স্বপ্ন পূরণের আরও এক ধাপ! {total_new}টি নতুন সরকারি চাকরির সার্কুলার।",
                        f"🇧🇩 বেকারত্বকে বিদায় জানানোর সময়! আজকে এসেছে {total_new}টি নতুন সার্কুলার।",
                        f"🇧🇩 সরকারি চাকরির সুবর্ণ সুযোগ! {total_new}টি নতুন বিজ্ঞপ্তি আপনার অপেক্ষায়।"
                    ]
                    bodies = [
                        f"'{display_name}' সহ দুর্দান্ত কিছু সার্কুলার যোগ হয়েছে। আপনার স্বপ্নের চাকরিটি হয়তো এই তালিকার ভেতরেই লুকিয়ে আছে! আজই চেক করুন।",
                        f"প্রতিটি সার্কুলার হতে পারে আপনার জীবনের টার্নিং পয়েন্ট! আজই আপনার যোগ্যতার সাথে মিলিয়ে আবেদন করে ফেলুন।"
                    ]
                    
                    title = random.choice(titles)
                    body = random.choice(bodies)
                    await send_expo_push_notifications(tokens, title, body, data={"type": "new_jobs", "count": total_new})
            else:
                logger.info("No device tokens found to send notifications.")

if __name__ == "__main__":
    asyncio.run(main())
