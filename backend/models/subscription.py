from pydantic import BaseModel
from typing import Optional
from datetime import date

class SubscriptionBase(BaseModel):
    name: str
    amount: float
    next_payment_date: date
    category_id: str = "subscriptions"
    is_active: bool = True

class SubscriptionCreate(SubscriptionBase):
    pass

class Subscription(SubscriptionBase):
    id: str
    user_id: str
    
    class Config:
        from_attributes = True
