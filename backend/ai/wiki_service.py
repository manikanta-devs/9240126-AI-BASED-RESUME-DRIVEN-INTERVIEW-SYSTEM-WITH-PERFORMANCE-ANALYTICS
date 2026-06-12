import logging
from typing import Optional

logger = logging.getLogger(__name__)

try:
    import wikipedia
except Exception:
    wikipedia = None


class WikiService:
    """Simple Wikipedia lookup helper to provide contextual summaries.

    Uses the `wikipedia` Python package to fetch page summaries. Returns
    a short (approx 400-800 char) summary suitable for inclusion in prompts.
    """

    def __init__(self):
        if wikipedia is None:
            logger.warning("`wikipedia` package not installed. Wiki lookups disabled.")

    def get_summary(self, topic: str, sentences: int = 3) -> Optional[str]:
        if wikipedia is None:
            return None

        if not topic:
            return None

        try:
            # Use search first to find the best page title
            search_results = wikipedia.search(topic, results=5)
            if not search_results:
                return None

            page_title = search_results[0]
            summary = wikipedia.summary(page_title, sentences=sentences, auto_suggest=False)
            # Trim excessively long summaries
            return summary.strip()
        except Exception as e:
            logger.debug(f"Wiki lookup failed for topic '{topic}': {e}")
            return None
