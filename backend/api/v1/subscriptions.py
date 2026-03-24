from fastapi import APIRouter, Depends
from ..deps import get_current_user
from db.supabase import supabase

router = APIRouter()

@router.get("/")
async def get_subscriptions(current_user = Depends(get_current_user)):
    response = supabase.table("subscriptions").select("*").eq("user_id", current_user.id).execute()
    return response.data

@router.post("/")
async def add_subscription(subscription: dict, current_user = Depends(get_current_user)):
    subscription["user_id"] = current_user.id
    response = supabase.table("subscriptions").insert(subscription).execute()
    return response.data[0]
