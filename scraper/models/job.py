from dataclasses import dataclass, field, asdict
from datetime import date, datetime
from typing import Optional
import hashlib
import json

@dataclass
class Job:
    title: str
    organization: str
    source: str
    source_url: str
    
    category: Optional[str] = None
    published_date: Optional[date] = None
    deadline: Optional[date] = None
    
    vacancies: Optional[int] = None
    employment_type: Optional[str] = None
    
    education: Optional[str] = None
    experience: Optional[str] = None
    age_requirement: Optional[str] = None
    
    location: Optional[str] = None
    salary: Optional[str] = None
    description: Optional[str] = None
    
    apply_url: Optional[str] = None
    circular_url: Optional[str] = None
    
    is_active: bool = True
    external_id: Optional[str] = None
    
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
