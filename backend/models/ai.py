from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Literal
from datetime import date

class AiInsight(BaseModel):
    id: str
    type: str  # warning, tip, success
    message: str
    category_id: Optional[str] = None

class AiChatRequest(BaseModel):
    message: str
    context_type: Optional[str] = "financial_advice"


VALID_CATEGORIES = {
    "food", "transport", "entertainment", "shopping",
    "health", "education", "housing", "subscriptions", "other"
}

VALID_CURRENCIES = {"KZT", "RUB", "USD", "EUR"}


class ReceiptItem(BaseModel):
    """Позиция чека - отдельный товар/услуга"""
    name: str
    amount: float


class ReceiptParseResult(BaseModel):
    """
    Валидированный результат парсинга чека от AI.
    Гарантирует структуру данных для фронтенда.
    """
    description: str = Field(..., min_length=1, max_length=500)
    amount: float = Field(..., ge=0, le=999999999)
    currency: Literal["KZT", "RUB", "USD", "EUR"] = "KZT"
    date: date
    category_id: str
    confidence: float = Field(default=0.5, ge=0.0, le=1.0)
    items: List[ReceiptItem] = Field(default_factory=list)
    
    @field_validator("category_id")
    @classmethod
    def validate_category(cls, v: str) -> str:
        if v not in VALID_CATEGORIES:
            raise ValueError(f"Invalid category: {v}. Must be one of: {VALID_CATEGORIES}")
        return v
    
    @field_validator("date", mode="before")
    @classmethod
    def parse_date(cls, v):
        if isinstance(v, date):
            return v
        if isinstance(v, str):
            try:
                return date.fromisoformat(v.replace("/", "-"))
            except ValueError:
                try:
                    return date.fromisoformat(v)
                except ValueError:
                    pass
        raise ValueError(f"Invalid date format: {v}")
