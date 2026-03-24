from fastapi import APIRouter, Depends
from ..deps import get_current_user
from db.supabase import supabase

router = APIRouter()

@router.get("/")
async def get_budgets(current_user = Depends(get_current_user)):
    response = supabase.table("budgets").select("*").eq("user_id", current_user.id).execute()
    return response.data

@router.post("/")
async def update_budget(budget: dict, current_user = Depends(get_current_user)):
    budget["user_id"] = current_user.id
    # Upsert based on category_id and user_id might need a unique constraint in DB
    response = supabase.table("budgets").upsert(budget).execute()
    return response.data[0]
