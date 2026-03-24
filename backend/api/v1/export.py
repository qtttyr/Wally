from fastapi import APIRouter, Depends, Response
from ..deps import get_current_user
from services.export_service import export_service
from db.supabase import supabase

router = APIRouter()

@router.get("/pdf")
async def export_pdf(current_user = Depends(get_current_user)):
    expenses_resp = supabase.table("expenses").select("*").eq("user_id", current_user.id).execute()
    pdf_content = export_service.generate_pdf_report(expenses_resp.data, current_user.email)
    
    return Response(
        content=pdf_content.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=report.pdf"}
    )

@router.get("/csv")
async def export_csv(current_user = Depends(get_current_user)):
    expenses_resp = supabase.table("expenses").select("*").eq("user_id", current_user.id).execute()
    csv_content = export_service.generate_csv_report(expenses_resp.data)
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=expenses.csv"}
    )
