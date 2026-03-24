from fastapi import APIRouter
from . import auth, scan, expenses, budgets, subscriptions, ai, export

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(scan.router, prefix="/scan", tags=["scan"])
api_router.include_router(expenses.router, prefix="/expenses", tags=["expenses"])
api_router.include_router(budgets.router, prefix="/budgets", tags=["budgets"])
api_router.include_router(subscriptions.router, prefix="/subscriptions", tags=["subscriptions"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(export.router, prefix="/export", tags=["export"])
