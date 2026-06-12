import logging
from typing import Optional

logger = logging.getLogger(__name__)

try:
    from transformers import pipeline
except Exception:
    pipeline = None


_shared_generator = None


class LocalLLM:
    """Optional local LLM runner using Hugging Face `transformers` pipeline.

    This class tries to load a small, CPU-friendly model (distilgpt2) for
    lightweight text generation. It's optional — if `transformers` isn't
    installed or the model can't be loaded, `is_available()` will be False.
    """

    MODEL_NAME = "distilgpt2"

    def __init__(self):
        global _shared_generator
        self.generator = None
        if pipeline is None:
            logger.info("transformers not installed — LocalLLM disabled")
            return

        if _shared_generator is not None:
            self.generator = _shared_generator
            return

        try:
            # Load a small model suitable for CPU inference
            self.generator = pipeline("text-generation", model=self.MODEL_NAME)
            _shared_generator = self.generator
            logger.info(f"LocalLLM initialized with model: {self.MODEL_NAME}")
        except Exception as e:
            logger.warning(f"Failed to initialize LocalLLM: {e}")
            self.generator = None

    def is_available(self) -> bool:
        return self.generator is not None

    def generate_content(self, prompt: str, max_tokens: int = 128) -> Optional[str]:
        if not self.is_available():
            return None

        try:
            outputs = self.generator(
                prompt, max_length=len(prompt.split()) + max_tokens, do_sample=True, top_p=0.95, temperature=0.8
            )
            if outputs and isinstance(outputs, list):
                text = outputs[0].get("generated_text", "")
                # Remove the prompt prefix if present
                if text.startswith(prompt):
                    text = text[len(prompt) :].strip()
                return text
        except Exception as e:
            logger.debug(f"LocalLLM generation failed: {e}")
        return None
