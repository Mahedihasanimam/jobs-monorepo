"""Current Teletalk AllJobs scraper using its public government-jobs API."""
from datetime import date
from typing import List

import httpx

from models.job import Job
from scrapers.base import BaseScraper
from utils.logger import get_logger

logger = get_logger(__name__)

class TeletalkScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.name = "Teletalk AllJobs"
        self.base_url = "https://alljobs.teletalk.com.bd"
        self.api_url = f"{self.base_url}/api/v1/govt-jobs"

    async def _json(self, url: str) -> dict:
        async with httpx.AsyncClient(timeout=self.timeout, headers=self.headers, follow_redirects=True) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()

    @staticmethod
    def _date(value: str | None) -> date | None:
        if not value:
            return None
        try:
            return date.fromisoformat(value[:10])
        except ValueError:
            return None

    async def scrape(self) -> List[Job]:
        logger.info("[%s] Fetching current government jobs from public API", self.name)
        payload = await self._json(f"{self.api_url}/org-list?page=1&limit=100")
        organizations = payload.get("govtOrgJobs") or []
        job_refs = [(organization, item) for organization in organizations for item in (organization.get("govt_jobs") or [])]
        jobs: list[Job] = []
        semaphore = __import__("asyncio").Semaphore(8)

        async def detail(organization: dict, item: dict):
            async with semaphore:
                try:
                    response = await self._json(f"{self.api_url}/public-details?id={item['id']}")
                    data = response.get("details") or {}
                    if data.get("status") != 5 or data.get("is_result") or data.get("is_notice"):
                        return None
                    org = data.get("job_utilities_govtorganization") or organization
                    media = f"{self.base_url}/media/"
                    advertisement = data.get("advertisement_file")
                    logo = org.get("logo")
                    gender = {1: "শুধু পুরুষ", 2: "শুধু নারী", 3: "নারী ও পুরুষ"}.get(data.get("gender"))
                    min_age, max_age = data.get("min_age"), data.get("max_age")
                    age = f"{min_age} থেকে {max_age} বছর" if min_age is not None and max_age is not None else None
                    return Job(
                        title=(data.get("job_title_bn") or data.get("job_title") or "").strip("[] "),
                        organization=org.get("name_bn") or org.get("name") or "সরকারি প্রতিষ্ঠান",
                        organization_logo_url=f"{media}{logo}" if logo else None,
                        source=self.name,
                        source_url=f"{self.base_url}/jobs/government/details/{data['id']}",
                        apply_url=data.get("application_site") or data.get("job_source"),
                        circular_url=f"{media}{advertisement}" if advertisement else None,
                        category="সরকারি চাকরি",
                        published_date=self._date(data.get("published_date") or data.get("advertisement_published_date")),
                        deadline=self._date(data.get("deadline_date")),
                        vacancies=int(data["vacancy"]) if str(data.get("vacancy", "")).isdigit() else None,
                        age_requirement=age,
                        gender_requirement=gender,
                        external_id=f"teletalk-{data['id']}",
                        is_active=True,
                    )
                except Exception as error:
                    logger.warning("Could not fetch Teletalk job %s: %s", item.get("id"), error)
                    return None

        import asyncio
        results = await asyncio.gather(*(detail(org, item) for org, item in job_refs))
        jobs.extend(job for job in results if job)
        logger.info("[%s] Parsed %s current job posts", self.name, len(jobs))
        return jobs
