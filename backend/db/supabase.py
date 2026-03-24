from supabase import create_client, Client
from core.config import settings

def get_supabase() -> Client:
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set")
    if not (settings.SUPABASE_URL.startswith("http://") or settings.SUPABASE_URL.startswith("https://")):
        raise RuntimeError("SUPABASE_URL must be a valid http(s) URL")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

def get_supabase_admin() -> Client:
    """Use this for system-level operations only"""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

supabase: Client | None
try:
    supabase = get_supabase()
except Exception:
    supabase = None
