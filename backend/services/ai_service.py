import json
import re
import logging
import base64
from datetime import date
from typing import Optional
from google import genai
from google.genai import types
from pydantic import ValidationError
from core.config import settings
from models.ai import ReceiptParseResult, VALID_CATEGORIES

logger = logging.getLogger("wally.ai")

CATEGORY_PROMPT = ", ".join(VALID_CATEGORIES)

RESPONSE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "description": {"type": "STRING"},
        "amount": {"type": "NUMBER"},
        "currency": {"type": "STRING"},
        "date": {"type": "STRING"},
        "category_id": {"type": "STRING"},
        "confidence": {"type": "NUMBER"}
    },
    "required": ["description", "amount", "currency", "date", "category_id", "confidence"]
}

VISION_PROMPT = f"""You are a receipt parser. Look at the receipt image and extract:
- description: store name or short summary (in Russian if Russian text present)
- amount: total amount paid (final number, NOT subtotal)
- currency: currency code (KZT, RUB, USD, EUR)
- date: purchase date in YYYY-MM-DD format
- category_id: one of [{CATEGORY_PROMPT}]
- confidence: your confidence 0.0-1.0

Return ONLY valid JSON, no markdown, no extra text.
"""


class AIService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = settings.AI_MODEL
        self._client = None

    @property
    def client(self):
        if self._client is None and self.api_key:
            try:
                self._client = genai.Client(api_key=self.api_key)
                logger.info("Gemini AI client initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini client: {e}")
                self._client = None
        return self._client

    async def parse_receipt_image(self, image_bytes: bytes) -> ReceiptParseResult:
        """
        PRIMARY method: send image directly to Gemini Vision (multimodal).
        No Tesseract required — Gemini reads the receipt itself.
        Falls back to regex on any failure.
        """
        if not self.client:
            logger.warning("Gemini client not available, returning fallback")
            return self._fallback_result()

        try:
            # Detect mime type from magic bytes
            mime_type = "image/jpeg"
            if image_bytes[:4] == b"\x89PNG":
                mime_type = "image/png"
            elif image_bytes[:4] == b"RIFF" or image_bytes[:4] == b"WEBP":
                mime_type = "image/webp"
            elif image_bytes[:3] == b"GIF":
                mime_type = "image/gif"

            image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)

            response = self.client.models.generate_content(
                model=self.model,
                contents=[image_part, VISION_PROMPT],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=RESPONSE_SCHEMA,
                ),
            )

            content = response.text.strip()
            logger.info(f"Gemini Vision raw response: {content[:200]}")
            data = json.loads(content)

            # Normalise category
            cat = data.get("category_id", "other").lower()
            if cat not in VALID_CATEGORIES:
                data["category_id"] = "other"

            return ReceiptParseResult.model_validate(data)

        except (json.JSONDecodeError, ValidationError) as e:
            logger.warning(f"Vision parse validation error: {e}")
            return self._fallback_result()
        except Exception as e:
            logger.error(f"Gemini Vision error: {e}", exc_info=True)
            return self._fallback_result()

    async def parse_receipt(self, raw_text: str) -> ReceiptParseResult:
        """
        Legacy text-based flow (kept for compatibility).
        Tries Gemini with text, then regex.
        """
        if not raw_text or len(raw_text.strip()) < 5:
            return self._fallback_result()

        if self.client:
            try:
                return await self._parse_with_ai(raw_text)
            except Exception as e:
                logger.error(f"AI parsing failed, trying regex: {e}")
                return self._parse_with_regex(raw_text)
        else:
            return self._parse_with_regex(raw_text)

    async def _parse_with_ai(self, raw_text: str) -> ReceiptParseResult:
        prompt = f"""Extract financial data from this receipt text.
Return ONLY JSON matching the schema.
Valid categories: {CATEGORY_PROMPT}

Receipt text:
{raw_text}
"""
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=RESPONSE_SCHEMA
                ),
            )
            content = response.text.strip()
            data = json.loads(content)

            cat = data.get("category_id", "other").lower()
            if cat not in VALID_CATEGORIES:
                data["category_id"] = "other"

            return ReceiptParseResult.model_validate(data)

        except (json.JSONDecodeError, ValidationError, Exception) as e:
            logger.warning(f"AI parse error: {e}")
            return self._parse_with_regex(raw_text)

    def _parse_with_regex(self, raw_text: str) -> ReceiptParseResult:
        result = {
            "description": "Чек",
            "amount": 0.0,
            "currency": "KZT",
            "date": date.today(),
            "category_id": "other",
            "confidence": 0.4
        }

        lines = [l.strip() for l in raw_text.split('\n') if l.strip()]
        if lines:
            result["description"] = lines[0][:50]

        amount_patterns = [
            r'(?:ИТОГО|ИТОГ|СУММА|TOTAL|К ОПЛАТЕ|ОПЛАЧЕНО)[:\s]*(\d+[\.,]\d{2})',
            r'(\d+[\.,]\d{2})\s*(?:KZT|RUB|USD|EUR|ТГ|РУБ|₽)',
            r'(\d+[\.,]\d{2})'
        ]
        for pattern in amount_patterns:
            matches = re.findall(pattern, raw_text, re.IGNORECASE)
            if matches:
                val = matches[-1].replace(',', '.')
                try:
                    result["amount"] = float(val)
                    result["confidence"] = 0.6
                    break
                except ValueError:
                    continue

        date_patterns = [
            r'(\d{2})[./](\d{2})[./](\d{4})',
            r'(\d{4})-(\d{2})-(\d{2})',
            r'(\d{2})[./](\d{2})[./](\d{2})'
        ]
        for pattern in date_patterns:
            match = re.search(pattern, raw_text)
            if match:
                try:
                    g = match.groups()
                    if len(g[0]) == 4:
                        result["date"] = date(int(g[0]), int(g[1]), int(g[2]))
                    else:
                        year = int(g[2])
                        if year < 100:
                            year += 2000
                        result["date"] = date(year, int(g[1]), int(g[0]))
                    result["confidence"] = max(result["confidence"], 0.7)
                    break
                except ValueError:
                    continue

        lower_text = raw_text.lower()
        keywords = {
            "food": ["магазин", "маркет", "продукты", "еда", "ресторан", "кафе", "burger", "pizza", "кофе"],
            "transport": ["такси", "uber", "яндекс", "автобус", "бензин", "заправка", "fuel"],
            "entertainment": ["кино", "театр", "музей", "билет", "game", "steam"],
            "health": ["аптека", "врач", "медицина", "клиника", "pharmacy"],
            "shopping": ["одежда", "обувь", "платье", "hm", "zara", "тц", "молл"],
            "housing": ["коммуналка", "аренда", "свет", "вода", "интернет"],
            "subscriptions": ["netflix", "spotify", "apple", "google", "cloud"]
        }
        for cat, kws in keywords.items():
            if any(kw in lower_text for kw in kws):
                result["category_id"] = cat
                result["confidence"] = max(result["confidence"], 0.6)
                break

        return ReceiptParseResult.model_validate(result)

    def _fallback_result(self) -> ReceiptParseResult:
        return ReceiptParseResult(
            description="Не удалось распознать",
            amount=0.0,
            currency="KZT",
            date=date.today(),
            category_id="other",
            confidence=0.0
        )


ai_service = AIService()
