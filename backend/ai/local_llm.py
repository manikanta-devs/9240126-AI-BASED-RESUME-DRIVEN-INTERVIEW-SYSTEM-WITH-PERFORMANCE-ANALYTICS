import logging
import os
import requests
from typing import Optional

logger = logging.getLogger(__name__)

# Try to import transformers lazily if needed as fallback
transformers_available = False
try:
    from transformers import pipeline
    transformers_available = True
except Exception:
    pass


class LocalLLM:
    """Production-grade Local LLM orchestrator.
    
    Prioritizes Ollama (running locally on port 11434) using standard HTTP requests
    to avoid high Python memory usage. If Ollama is unavailable, it falls back
    to a lazy-loaded local Hugging Face model (distilgpt2) as an offline reserve.
    """

    def __init__(self):
        self.ollama_url = os.getenv("LOCAL_LLM_API_URL", "http://localhost:11434/api/generate").strip()
        self.ollama_model = os.getenv("LOCAL_LLM_MODEL", "llama3").strip()
        self.hf_generator = None
        self.hf_initialized = False

    def is_ollama_available(self) -> bool:
        """Check if local Ollama daemon is running and responding."""
        try:
            # Simple ping to Ollama base endpoint
            base_url = self.ollama_url.split("/api/")[0]
            response = requests.get(base_url, timeout=1.5)
            return response.status_code == 200
        except Exception:
            return False

    def _init_hf_fallback(self):
        """Lazy-initialize Hugging Face fallback pipeline to save startup memory."""
        if self.hf_initialized:
            return
        
        if not transformers_available:
            logger.info("Transformers library not available for HF fallback.")
            self.hf_initialized = True
            return

        try:
            logger.info("Loading Hugging Face fallback pipeline (distilgpt2)...")
            self.hf_generator = pipeline("text-generation", model="distilgpt2")
            logger.info("Hugging Face fallback model loaded successfully.")
        except Exception as e:
            logger.warning(f"Failed to load Hugging Face fallback: {e}")
            self.hf_generator = None
        self.hf_initialized = True

    def is_available(self) -> bool:
        """System is available if Ollama is running OR Hugging Face fallback is loaded."""
        if self.is_ollama_available():
            return True
        
        # Check if we should initialize HF fallback
        if transformers_available:
            self._init_hf_fallback()
            return self.hf_generator is not None
            
        return False

    def generate_content(self, prompt: str, max_tokens: int = 128) -> Optional[str]:
        """Generate content locally."""
        # 1. Primary: Try Ollama API (HTTP, ultra-low python memory)
        if self.is_ollama_available():
            try:
                logger.info(f"LocalLLM using local Ollama model: {self.ollama_model}")
                payload = {
                    "model": self.ollama_model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "num_predict": max_tokens
                    }
                }
                response = requests.post(self.ollama_url, json=payload, timeout=15)
                if response.status_code == 200:
                    result = response.json()
                    return result.get("response", "").strip()
                logger.warning(f"Ollama returned status code: {response.status_code}")
            except Exception as e:
                logger.error(f"Ollama generation failed: {e}")

        # 2. Secondary Fallback: Hugging Face pipeline
        self._init_hf_fallback()
        if self.hf_generator:
            try:
                logger.info("LocalLLM falling back to Hugging Face pipeline...")
                outputs = self.hf_generator(
                    prompt,
                    max_length=len(prompt.split()) + max_tokens,
                    do_sample=True,
                    top_p=0.95,
                    temperature=0.8
                )
                if outputs and isinstance(outputs, list):
                    text = outputs[0].get("generated_text", "")
                    if text.startswith(prompt):
                        text = text[len(prompt):].strip()
                    return text
            except Exception as e:
                logger.error(f"Hugging Face fallback generation failed: {e}")

        return None
