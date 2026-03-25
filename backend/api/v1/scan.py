from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
import logging
from services.ai_service import ai_service
from ..deps import get_current_user
import PIL.Image
import io

router = APIRouter()
logger = logging.getLogger("wally.scan")


@router.post("/process")
async def process_receipt(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    """
    1. Receive image
    2. Send image directly to Gemini Vision (multimodal) — no Tesseract dependency
    3. Return structured JSON
    """
    try:
        contents = await file.read()

        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded")

        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 10MB)")

        # Validate image format
        try:
            image = PIL.Image.open(io.BytesIO(contents))
            image.verify()
            image = PIL.Image.open(io.BytesIO(contents))  # re-open after verify()
        except Exception as e:
            logger.error(f"Invalid image: {e}")
            raise HTTPException(status_code=400, detail="Invalid image format")

        # Send image directly to Gemini Vision — skips Tesseract entirely
        structured_data = await ai_service.parse_receipt_image(image_bytes=contents)

        logger.info(
            f"Parsed receipt via vision: amount={structured_data.amount}, "
            f"confidence={structured_data.confidence}"
        )

        return {
            "description": structured_data.description,
            "amount": structured_data.amount,
            "currency": structured_data.currency,
            "date": structured_data.date.isoformat() if structured_data.date else None,
            "category_id": structured_data.category_id,
            "confidence": structured_data.confidence,
            "items": [{"name": item.name, "amount": item.amount} for item in structured_data.items],
            "demo_mode": False,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Scan processing error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Scan processing failed: {str(e)}")
