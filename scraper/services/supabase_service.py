from supabase import create_client, Client
import os
from typing import List, Dict, Tuple
from models.job import Job
from models.exam_notice import ExamNotice
from utils.logger import get_logger

logger = get_logger(__name__)

class SupabaseJobService:
    def __init__(self):
        self.url = os.environ.get("SUPABASE_URL")
        self.key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        self.client: Client | None = None
        
        if self.url and self.key:
            self.client = create_client(self.url, self.key)
        else:
            logger.warning("Supabase credentials not found. DB operations will be skipped if not dry-run.")

    def is_configured(self) -> bool:
        return self.client is not None

    def upsert_jobs(self, jobs: List[Job], dry_run: bool = False) -> Tuple[int, int]:
        """
        Upserts jobs into Supabase in batch.
        Returns (new_jobs_count, updated_jobs_count)
        """
        if not jobs:
            return 0, 0
            
        data = [job.to_dict() for job in jobs]
        
        if dry_run:
            logger.info(f"[DRY RUN] Would upsert {len(jobs)} jobs.")
            return len(jobs), 0
            
        if not self.is_configured():
            logger.error("Cannot upsert: Supabase client not configured.")
            return 0, 0
            
        try:
            # The Supabase Python client upsert signature: 
            # table.upsert(data, on_conflict="source,source_url")
            
            response = self.client.table("jobs").upsert(
                data, 
                on_conflict="external_id"
            ).execute()
            
            # Since upsert returns the inserted/updated rows, we can't easily 
            # differentiate between new vs updated unless we check created_at == updated_at
            # or compare against existing data. We will just return total processed.
            
            processed = len(response.data) if response.data else 0
            logger.info(f"Successfully upserted {processed} jobs.")
            return processed, 0 
            
        except Exception as e:
            logger.error(f"Failed to upsert jobs: {e}")
            return 0, 0

    def mark_expired_jobs(self, dry_run: bool = False) -> int:
        """Marks jobs whose deadline has passed as inactive."""
        from datetime import date
        today = date.today().isoformat()
        
        if dry_run:
            logger.info(f"[DRY RUN] Would mark expired jobs before {today}.")
            return 0
        if not self.is_configured():
            return 0
            
        try:
            response = self.client.table("jobs")\
                .update({"is_active": False})\
                .lt("deadline", today)\
                .eq("is_active", True)\
                .execute()
                
            count = len(response.data) if response.data else 0
            if count > 0:
                logger.info(f"Marked {count} expired jobs as inactive.")
            return count
        except Exception as e:
            logger.error(f"Failed to mark expired jobs: {e}")
            return 0

    def upsert_exam_notices(self, notices: List[ExamNotice], dry_run: bool = False) -> int:
        if not notices:
            return 0
        if dry_run:
            return len(notices)
        if not self.is_configured():
            return 0
        try:
            response = self.client.table("exam_notices").upsert(
                [notice.to_dict() for notice in notices], on_conflict="source,source_url"
            ).execute()
            return len(response.data) if response.data else 0
        except Exception as error:
            logger.error(f"Failed to upsert exam notices: {error}")
            return 0

    def mark_expired_exam_notices(self, dry_run: bool = False) -> int:
        from datetime import date
        today = date.today().isoformat()
        if dry_run or not self.is_configured():
            return 0
        try:
            response = self.client.table("exam_notices").update({"is_active": False})\
                .lt("exam_date", today).in_("notice_type", ["exam_schedule", "admit_card"])\
                .eq("is_active", True).execute()
            return len(response.data) if response.data else 0
        except Exception as error:
            logger.error(f"Failed to mark expired exam notices: {error}")
            return 0
