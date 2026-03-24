from pydantic import BaseModel, Field
from typing import Optional
from datetime import date as date_type

class ExpenseBase(BaseModel):
    amount: float
    category_id: str
    date: date_type
    description: Optional[str] = None
    receipt_url: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class Expense(ExpenseBase):
    id: str
    user_id: str
    created_at: str

    class Config:
        from_attributes = True
