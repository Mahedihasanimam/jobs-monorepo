from supabase import create_client, Client
import os
from typing import List, Dict, Tuple
from models.job import Job
from models.exam_notice import ExamNotice
from utils.logger import get_logger
from utils.job_notice import is_recruitment_notice

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

    def get_existing_jobs_by_source(self, source: str) -> Dict[str, dict]:
        """Fetch existing jobs for a source to prevent re-processing."""
        if not self.is_configured():
            return {}
        try:
            response = self.client.table("jobs").select("*").eq("source", source).execute()
            return {row["source_url"]: row for row in response.data} if response.data else {}
        except Exception as e:
            logger.error(f"Failed to fetch existing jobs for {source}: {e}")
            return {}

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
            response = self.client.table("jobs").update({"is_active": False})\
                .lt("deadline", today).eq("is_active", True).execute()
            count = len(response.data) if response.data else 0
            if count > 0:
                logger.info(f"Marked {count} expired jobs as inactive.")
            return count
        except Exception as e:
            logger.error(f"Failed to mark expired jobs: {e}")
            return 0

    def quarantine_non_recruitment_jobs(self, dry_run: bool = False) -> int:
        """Hide misclassified notices and remove derived eligibility claims."""
        if not self.is_configured() or dry_run:
            return 0
        try:
            rows = self.client.table("jobs").select("id,title,source").execute().data or []
            invalid_ids = [row["id"] for row in rows if row.get("source") != "Teletalk AllJobs" and not is_recruitment_notice(row.get("title") or "")]
            if not invalid_ids:
                return 0
            payload = {
                "is_active": False, "education": None, "subject": None, "experience": None,
                "age_requirement": None, "gender_requirement": None, "quota_requirement": None,
                "salary": None, "application_fee": None, "location": None, "vacancies": None,
                "freshers_allowed": None, "eligibility_summary": None, "eligible_applicants": None,
                "requirement_confidence": {}, "requirement_sources": {},
                "circular_processing_status": "not_recruitment",
            }
            response = self.client.table("jobs").update(payload).in_("id", invalid_ids).execute()
            count = len(response.data) if response.data else 0
            logger.info("Quarantined %s non-recruitment notices.", count)
            return count
        except Exception as error:
            logger.error("Failed to quarantine non-recruitment notices: %s", error)
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

    def get_all_device_tokens(self) -> List[str]:
        """Fetches all device tokens for push notifications."""
        if not self.is_configured():
            return []
        try:
            response = self.client.table("device_tokens").select("token").execute()
            if response.data:
                return [row["token"] for row in response.data]
            return []
        except Exception as error:
            logger.error(f"Failed to fetch device tokens: {error}")
            return []

    def get_approaching_deadlines(self, days_away: int) -> List[dict]:
        """Fetches active jobs whose deadline is exactly `days_away` days from today."""
        from datetime import date, timedelta
        target_date = (date.today() + timedelta(days=days_away)).isoformat()
        if not self.is_configured():
            return []
        try:
            response = self.client.table("jobs").select("id, title, organization, deadline").eq("is_active", True).eq("deadline", target_date).execute()
            return response.data if response.data else []
        except Exception as error:
            logger.error(f"Failed to fetch jobs for deadline {target_date}: {error}")
            return []

    def get_job_subscribers(self, job_id: int) -> List[str]:
        """Fetches device tokens for users subscribed to a specific job."""
        if not self.is_configured():
            return []
        try:
            response = self.client.table("job_subscriptions").select("token").eq("job_id", job_id).execute()
            if response.data:
                return [row["token"] for row in response.data]
            return []
        except Exception as error:
            logger.error(f"Failed to fetch subscribers for job {job_id}: {error}")
            return []
