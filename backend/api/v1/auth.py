from fastapi import APIRouter, Depends
from ..deps import get_current_user

router = APIRouter()

@router.get("/me")
async def read_users_me(current_user = Depends(get_current_user)):
    return current_user
