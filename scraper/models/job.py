from dataclasses import dataclass, field, asdict
from datetime import date, datetime
from typing import Any, Dict, List, Optional
import hashlib
import json

@dataclass
class Job:
    title: str
    organization: str
    source: str
    source_url: str
    organization_logo_url: Optional[str] = None
    is_government_source: bool = False
    
    category: Optional[str] = None
    published_date: Optional[date] = None
    deadline: Optional[date] = None
    
    vacancies: Optional[int] = None
    employment_type: Optional[str] = None
    
    education: Optional[str] = None
    experience: Optional[str] = None
    age_requirement: Optional[str] = None
    eligibility_summary: Optional[str] = None
    eligible_applicants: Optional[str] = None
    qualification_tags: List[str] = field(default_factory=list)
    
    location: Optional[str] = None
    salary: Optional[str] = None
    subject: Optional[str] = None
    gender_requirement: Optional[str] = None
    quota_requirement: Optional[str] = None
    application_fee: Optional[str] = None
    freshers_allowed: Optional[bool] = None
    description: Optional[str] = None
    circular_text: Optional[str] = None
    circular_document_hash: Optional[str] = None
    circular_extraction_method: Optional[str] = None
    circular_processing_status: Optional[str] = None
    requirement_confidence: Dict[str, float] = field(default_factory=dict)
    requirement_sources: Dict[str, Any] = field(default_factory=dict)
    
    apply_url: Optional[str] = None
    circular_url: Optional[str] = None
    
    is_active: bool = True
    external_id: Optional[str] = None

    def __post_init__(self) -> None:
        """Mark records from known official Bangladesh government hosts."""
        from urllib.parse import urlparse
        host = (urlparse(self.source_url).hostname or "").lower()
        self.is_government_source = self.is_government_source or host == "gov.bd" or host.endswith(".gov.bd") or host == "teletalk.com.bd" or host.endswith(".teletalk.com.bd")

        qualification_text = " ".join(filter(None, (
            self.title, self.education, self.description
        ))).lower()
        diploma_terms = ("diploma", "ডিপ্লোমা", "ডিপ্লোমাধারী", "ডিপ্লোমা-ইন")
        if any(term in qualification_text for term in diploma_terms) and "diploma" not in self.qualification_tags:
            self.qualification_tags.append("diploma")

        if not self.eligibility_summary:
            requirements = [value.strip() for value in (
                self.education, self.experience, self.age_requirement
            ) if value and value.strip()]
            self.eligibility_summary = "\n".join(requirements) or None

        if not self.eligible_applicants and self.eligibility_summary:
            self.eligible_applicants = (
                "অফিসিয়াল বিজ্ঞপ্তিতে উল্লেখিত শিক্ষা, অভিজ্ঞতা ও বয়সের শর্ত "
                "পূরণকারী প্রার্থীরা আবেদন করতে পারবেন।"
            )
    
    def generate_fingerprint(self) -> str:
        """
        Generates a deterministic fingerprint based on organization, title, and deadline.
        This helps identify duplicates even if the source URL changes.
        """
        components = [
            self.organization.strip().lower(),
            self.title.strip().lower(),
            self.deadline.isoformat() if self.deadline else "no_deadline"
        ]
        raw = "|".join(components)
        return hashlib.sha256(raw.encode('utf-8')).hexdigest()

    def to_dict(self) -> dict:
        """Converts Job to a dictionary, handling datetime and date serialization."""
        
        if not self.external_id:
            self.external_id = self.generate_fingerprint()
            
        data = asdict(self)
        
        # Serialize dates for Supabase (JSON standard format)
        for key, value in data.items():
            if isinstance(value, (date, datetime)):
                data[key] = value.isoformat()
                
        return data
