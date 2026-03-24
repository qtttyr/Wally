"""
Security utilities for Wally API.

Design Decision: Authentication is handled by Supabase Auth.
We use Supabase JWT tokens which are validated server-side via
supabase.auth.get_user(). This provides:

1. Automatic token refresh handling
2. Secure token validation against Supabase servers
3. RLS (Row Level Security) integration
4. OAuth provider support (Google, etc.)

Custom JWT handling is NOT needed because:
- Supabase manages token lifecycle
- We don't need custom claims beyond user_id
- Service role key bypasses RLS, so we avoid it in auth flows

If you need custom JWT features in the future:
1. Add custom claims via Supabase Edge Functions
2. Use supabase.auth.get_user() for validation
3. Optionally decode claims for logging/debugging

Never:
- Sign tokens manually with custom secrets
- Bypass RLS for user data operations
- Store tokens in localStorage (use httpOnly cookies instead)
"""

from typing import Optional
from datetime import datetime, timedelta
from jose import jwt, JWTError
from core.config import settings


ALGORITHM = "HS256"


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a signed JWT token for internal use.
    
    WARNING: This is for internal service-to-service communication only.
    For user authentication, use Supabase Auth.
    
    Args:
        data: Payload to encode in the token
        expires_delta: Token expiration time
        
    Returns:
        Encoded JWT string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=1)
        
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SUPABASE_SERVICE_ROLE_KEY,  # Only for internal tokens
        algorithm=ALGORITHM
    )
    return encoded_jwt


def decode_token_unsafe(token: str) -> Optional[dict]:
    """
    Decode JWT without verification.
    
    WARNING: Do not use for authentication!
    Only use for logging, debugging, or extracting non-sensitive info.
    
    Args:
        token: JWT string
        
    Returns:
        Decoded claims or None if invalid format
    """
    try:
        return jwt.get_unverified_claims(token)
    except JWTError:
        return None


def get_token_expiry(token: str) -> Optional[datetime]:
    """
    Get expiration time from a JWT token.
    
    Args:
        token: JWT string
        
    Returns:
        Expiration datetime or None
    """
    claims = decode_token_unsafe(token)
    if claims and "exp" in claims:
        return datetime.fromtimestamp(claims["exp"])
    return None


def is_token_expired(token: str) -> bool:
    """
    Check if a token is expired.
    
    Args:
        token: JWT string
        
    Returns:
        True if expired, False otherwise
    """
    expiry = get_token_expiry(token)
    if expiry is None:
        return True
    return datetime.utcnow() >= expiry


def extract_user_id(token: str) -> Optional[str]:
    """
    Extract user_id from JWT without verification.
    
    WARNING: Do not use for authentication!
    Supabase validates tokens server-side.
    
    Args:
        token: JWT string
        
    Returns:
        User ID or None
    """
    claims = decode_token_unsafe(token)
    if claims and "sub" in claims:
        return claims["sub"]
    return None


class SecurityHeaders:
    """
    Helper for setting security-related HTTP headers.
    """
    
    @staticmethod
    def get_default_headers() -> dict:
        return {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Content-Security-Policy": "default-src 'self'",
        }
    
    @staticmethod
    def get_csp_for_frontend(origin: str) -> dict:
        """
        Get Content-Security-Policy for frontend integration.
        
        Args:
            origin: Frontend origin (e.g., https://app.wally.finance)
        """
        return {
            "Content-Security-Policy": (
                f"default-src 'self'; "
                f"script-src 'self' 'unsafe-inline'; "
                f"style-src 'self' 'unsafe-inline'; "
                f"img-src 'self' data: https:; "
                f"connect-src 'self' {origin} https://*.supabase.co; "
                f"frame-ancestors 'none';"
            )
        }
