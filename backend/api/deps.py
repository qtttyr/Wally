from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError, ExpiredSignatureError
from db.supabase import supabase
from core.config import settings
from typing import Optional

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)


def decode_token_unsafe(token: str) -> Optional[dict]:
    """
    Decode JWT without verification to extract claims.
    Used only for logging/debugging. Actual verification done by Supabase.
    """
    try:
        return jwt.get_unverified_claims(token)
    except JWTError:
        return None


async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> dict:
    """
    Verifies the JWT token from Supabase Auth.
    
    Security: Uses Supabase SDK's get_user() which validates the token
    against Supabase servers. This ensures:
    1. Token is not expired
    2. Token was signed by Supabase
    3. Token hasn't been revoked
    
    We do NOT use service_role_key here - only anon key for RLS.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не удалось подтвердить учетные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_expired_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Срок действия токена истёк",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exception

    if supabase is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase не настроен на бэкенде",
        )

    try:
        user_response = supabase.auth.get_user(token)
        
        if not user_response or not user_response.user:
            raise credentials_exception
            
        return {
            "id": user_response.user.id,
            "email": user_response.user.email,
            "aud": user_response.user.aud,
            "role": user_response.user.role,
            "created_at": str(user_response.user.created_at),
        }
        
    except ExpiredSignatureError:
        raise token_expired_exception
    except Exception as e:
        raise credentials_exception


async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme)
) -> Optional[dict]:
    """
    Optional auth - returns None if no token or invalid token.
    Use this for endpoints that work both for authenticated and anonymous users.
    """
    if not token:
        return None
    
    try:
        return await get_current_user(token)
    except HTTPException:
        return None


def verify_budget_owner(user_id: str, budget_user_id: str) -> None:
    """
    Verify that the current user owns the budget resource.
    Raises 403 if user doesn't own the resource.
    """
    if user_id != budget_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет доступа к этому ресурсу",
        )
