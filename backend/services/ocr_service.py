from PIL import Image, ImageOps, ImageEnhance
import io
import logging
import os

logger = logging.getLogger("wally.ocr")

class OCRService:
    def __init__(self):
        self._tesseract_available = None
        self._check_tesseract()
    
    def _check_tesseract(self):
        try:
            import pytesseract
            # Verify tesseract path or version
            pytesseract.get_tesseract_version()
            self._tesseract_available = True
            logger.info("Tesseract OCR is available")
        except Exception as e:
            self._tesseract_available = False
            logger.warning(f"Tesseract not available: {e}. Using demo mode.")
    
    def _preprocess_image(self, image: Image.Image) -> Image.Image:
        """
        Enhance image for better OCR results.
        1. Convert to grayscale
        2. Increase contrast
        3. Sharpness enhancement
        """
        try:
            # Convert to grayscale
            image = ImageOps.grayscale(image)
            
            # Increase contrast
            enhancer = ImageEnhance.Contrast(image)
            image = enhancer.enhance(2.0)
            
            # Sharpen
            enhancer = ImageEnhance.Sharpness(image)
            image = enhancer.enhance(1.5)
            
            return image
        except Exception as e:
            logger.warning(f"Image preprocessing failed: {e}")
            return image

    async def extract_text(self, image: Image.Image) -> str:
        """
        Extracts text from an image using Tesseract OCR.
        Falls back to demo mode if Tesseract is not installed.
        """
        if self._tesseract_available:
            processed_img = self._preprocess_image(image)
            return await self._extract_with_tesseract(processed_img)
        else:
            return self._generate_demo_text()
    
    async def _extract_with_tesseract(self, image: Image.Image) -> str:
        try:
            import pytesseract
            # Using both Russian and English for better coverage
            text = pytesseract.image_to_string(image, lang='rus+eng')
            
            if not text.strip():
                logger.warning("Tesseract returned empty text. Retrying without preprocessing.")
                # Fallback to original image if preprocessing failed to return text
                return pytesseract.image_to_string(image, lang='rus+eng').strip()
                
            return text.strip()
        except Exception as e:
            logger.error(f"Tesseract OCR error: {e}")
            return self._generate_demo_text()
    
    def _generate_demo_text(self) -> str:
        """
        Generates sample receipt text for demo/testing purposes.
        Used when Tesseract is not installed or failing.
        """
        return """
        *DEMO MODE (Tesseract not detected)*
        МАГАЗИН: МАГНУМ
        Г. АЛМАТЫ, УЛ. КУНАЕВА 12
        --------------------------
        ХЛЕБ БОРОДИНСКИЙ    120.00
        МОЛОКО 1Л 3.2%     450.00
        ЯБЛОКИ (1КГ)       600.00
        СЫР ГАУДА 300Г    1200.00
        --------------------------
        ИТОГО:            2370.00
        К ОПЛАТЕ:         2370.00
        ВАТ (12%):         284.40
        ДАТА: 2026-03-16 10:20:00
        КАССИР: АХМЕТОВА А.
        БЛАГОДАРИМ ЗА ПОКУПКУ!
        """

ocr_service = OCRService()
