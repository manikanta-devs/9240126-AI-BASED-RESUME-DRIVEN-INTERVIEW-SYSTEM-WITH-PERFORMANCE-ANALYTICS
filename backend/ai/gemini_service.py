import os
import time
import logging
import json
import re
from typing import Optional

logger = logging.getLogger(__name__)


class GeminiService:
    """Wrapper around Google Gemini AI API with retry logic and robust JSON parsing"""

    MODEL_NAME = "gemini-2.0-flash"
    MAX_RETRIES = 3
    RETRY_DELAY = 2

    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.client = None
        self._initialize()

    def _initialize(self):
        """Initialize Gemini client"""
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not set. AI features will use fallback mode.")
            logger.info("Get a free API key at: https://aistudio.google.com/app/apikey")
            return

        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            self.client = genai.GenerativeModel(self.MODEL_NAME)
            logger.info(f"Gemini AI initialized with model: {self.MODEL_NAME}")
        except ImportError:
            logger.error("google-generativeai package not installed. Run: pip install google-generativeai")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini: {e}")

    def is_available(self) -> bool:
        """Check if Gemini API is available"""
        return self.client is not None and self.api_key is not None

    def generate_content(self, prompt: str, temperature: float = 0.7) -> Optional[str]:
        """Generate content using Gemini API with retry logic"""
        if not self.is_available():
            logger.warning("Gemini not available, returning None")
            return None

        for attempt in range(self.MAX_RETRIES):
            try:
                start_time = time.time()
                import google.generativeai as genai
                generation_config = genai.types.GenerationConfig(
                    temperature=temperature,
                    max_output_tokens=4096,
                )
                response = self.client.generate_content(
                    prompt,
                    generation_config=generation_config
                )
                elapsed = round(time.time() - start_time, 2)
                logger.info(f"Gemini response in {elapsed}s (attempt {attempt + 1})")
                return response.text.strip()

            except Exception as e:
                logger.error(f"Gemini API attempt {attempt + 1}/{self.MAX_RETRIES} failed: {e}")
                if attempt < self.MAX_RETRIES - 1:
                    time.sleep(self.RETRY_DELAY * (attempt + 1))
                else:
                    logger.error("All Gemini API attempts failed")
                    return None

    def generate_json(self, prompt: str) -> Optional[dict]:
        """Generate JSON response from Gemini with multi-strategy parsing"""
        json_prompt = f"""{prompt}

IMPORTANT: Respond ONLY with valid JSON. No markdown, no backticks, no explanation.
Just the raw JSON object or array."""

        response = self.generate_content(json_prompt, temperature=0.3)
        if not response:
            return None

        # Strategy 1: Try parsing raw response directly
        try:
            return json.loads(response.strip())
        except json.JSONDecodeError:
            pass

        # Strategy 2: Strip markdown code fences
        cleaned = response.strip()
        if cleaned.startswith('```'):
            lines = cleaned.split('\n')
            # Remove first line (```json or ```) and last line (```)
            if len(lines) >= 3:
                cleaned = '\n'.join(lines[1:-1])
            else:
                cleaned = '\n'.join(lines[1:])
        cleaned = cleaned.strip('`').strip()

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            pass

        # Strategy 3: Regex extract JSON object or array
        json_match = re.search(r'(\{[\s\S]*\}|\[[\s\S]*\])', cleaned)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass

        logger.error(f"All JSON parse strategies failed. Response preview: {response[:300]}")
        return None
