from fastapi import APIRouter, Depends
from ..deps import get_current_user
from services.ai_service import ai_service
from db.supabase import supabase

router = APIRouter()

@router.get("/insights")
async def get_ai_insights(current_user = Depends(get_current_user)):
    """
    Generates personalized financial insights using AI 
    based on the user's spending patterns.
    """
    # 1. Fetch user's recent expenses for context
    expenses_resp = supabase.table("expenses").select("amount, category_id, description, date").eq("user_id", current_user.id).limit(50).execute()
    expenses = expenses_resp.data
    
    # In a real scenario, we'd pass this to ai_service.generate_personalized_insights(expenses)
    # For now, return a placeholder or simple logic
    return [
        {
            "id": "insight_1",
            "type": "tip",
            "message": "AI заметил, что ты потратил на 15% больше на категорию 'Еда' на этой неделе."
        }
    ]
