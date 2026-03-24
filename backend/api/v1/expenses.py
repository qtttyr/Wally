from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ..deps import get_current_user
from db.supabase import supabase

router = APIRouter()

@router.get("/")
async def get_expenses(current_user = Depends(get_current_user)):
    response = supabase.table("expenses").select("*").eq("user_id", current_user.id).order("date", desc=True).execute()
    return response.data

@router.post("/")
async def create_expense(expense: dict, current_user = Depends(get_current_user)):
    expense["user_id"] = current_user.id
    response = supabase.table("expenses").insert(expense).execute()
    return response.data[0]

@router.delete("/{expense_id}")
async def delete_expense(expense_id: str, current_user = Depends(get_current_user)):
    response = supabase.table("expenses").delete().eq("id", expense_id).eq("user_id", current_user.id).execute()
    return {"status": "success"}
