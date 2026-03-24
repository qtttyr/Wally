from pydantic import BaseModel
from typing import Optional

class BudgetBase(BaseModel):
    category_id: str
    amount: float
    period: str = "monthly"

class BudgetCreate(BudgetBase):
    pass

class Budget(BudgetBase):
    id: str
    user_id: str
    
    class Config:
        from_attributes = True
