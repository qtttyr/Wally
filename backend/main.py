from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from core.logging import get_logger
from api.v1.api import api_router

logger = get_logger("main")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.get("/")
async def root():
    return {"message": "Welcome to Wally API", "status": "online"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.on_event("startup")
async def startup_event():
    logger.info(f"{settings.PROJECT_NAME} started")
    logger.info(f"Debug mode: {settings.DEBUG}")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info(f"{settings.PROJECT_NAME} shutting down")
