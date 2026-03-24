from pydantic import BaseModel
from typing import Optional, List

class ScanResult(BaseModel):
    description: str
    amount: float
    currency: str = "KZT"
    date: str
    category_id: str
    confidence: float
    raw_text: Optional[str] = None
