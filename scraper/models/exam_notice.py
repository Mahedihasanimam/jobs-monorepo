from dataclasses import asdict, dataclass
from datetime import date, datetime
from typing import Optional
import hashlib

@dataclass
class ExamNotice:
    title: str
    organization: str
    source: str
    source_url: str
    notice_type: str
    organization_logo_url: Optional[str] = None
    published_date: Optional[date] = None
    exam_date: Optional[date] = None
    circular_url: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True
    external_id: Optional[str] = None

    def to_dict(self) -> dict:
        self.external_id = self.external_id or hashlib.sha256(f"{self.organization}|{self.title}|{self.source_url}".lower().encode()).hexdigest()
        data = asdict(self)
        for key, value in data.items():
            if isinstance(value, (date, datetime)):
                data[key] = value.isoformat()
        return data
