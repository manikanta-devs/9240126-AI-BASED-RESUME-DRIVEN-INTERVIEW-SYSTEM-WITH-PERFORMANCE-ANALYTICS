"""
prompt_sanitizer.py — Sanitize user-supplied text before embedding in AI prompts.
Prevents prompt injection attacks where a user crafts text to override AI instructions.
"""
import re


# Phrases that are classic prompt injection patterns
_INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|above|prior)\s+instructions?",
    r"disregard\s+(all\s+)?(previous|above|prior)\s+instructions?",
    r"forget\s+(all\s+)?(previous|above|prior)\s+instructions?",
    r"you\s+are\s+now\s+a",
    r"new\s+instructions?:",
    r"system\s+prompt",
    r"act\s+as\s+(if\s+you\s+are\s+)?(?:an?\s+)?(?:AI|bot|assistant|DAN)",
    r"jailbreak",
    r"do\s+anything\s+now",
]

_INJECTION_RE = re.compile(
    "|".join(_INJECTION_PATTERNS),
    re.IGNORECASE | re.DOTALL,
)


def sanitize_for_prompt(text: str, max_length: int = 4000) -> str:
    """
    Sanitize user-supplied text before embedding it in an AI prompt.

    - Truncates to max_length characters
    - Escapes curly braces so f-strings don't interpret them as format vars
    - Removes known prompt injection phrases
    - Strips null bytes and control characters

    Returns the sanitized string.
    """
    if not text:
        return ""

    # Truncate first to avoid processing giant inputs
    text = text[:max_length]

    # Remove null bytes and non-printable control characters (keep newlines/tabs)
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)

    # Replace curly braces so f-string formatting can't be exploited
    text = text.replace("{", "(").replace("}", ")")

    # Remove prompt injection phrases
    text = _INJECTION_RE.sub("[redacted]", text)

    return text.strip()


def sanitize_answer(answer: str) -> str:
    """Sanitize a candidate's spoken/typed answer before AI evaluation."""
    return sanitize_for_prompt(answer, max_length=3000)


def sanitize_resume_text(text: str) -> str:
    """Sanitize resume text before it enters question generation prompts."""
    return sanitize_for_prompt(text, max_length=8000)
