import logging
import requests
from typing import Optional

logger = logging.getLogger(__name__)

# Module-level in-memory cache to store fetched summaries
_WIKI_CACHE = {}


class WikiService:
    """Simple Wikipedia lookup helper to provide contextual summaries.

    Uses direct requests to Wikipedia Action API with a strict timeout and
    in-memory caching to guarantee fast, real-time responses.
    """

    def __init__(self):
        pass

    def get_summary(self, topic: str, sentences: int = 3) -> Optional[str]:
        if not topic:
            return None

        topic_clean = topic.strip().lower()
        if topic_clean in _WIKI_CACHE:
            logger.info(f"Wiki cache hit for topic: {topic_clean}")
            return _WIKI_CACHE[topic_clean]

        try:
            # Step 1: Search for the topic on Wikipedia
            search_url = "https://en.wikipedia.org/w/api.php"
            search_params = {
                "action": "query",
                "list": "search",
                "srsearch": topic,
                "format": "json",
                "utf8": "1",
                "srlimit": "1"
            }
            
            # Strict 1.0s timeout to keep the app responsive
            response = requests.get(search_url, params=search_params, timeout=1.0)
            if response.status_code != 200:
                _WIKI_CACHE[topic_clean] = None
                return None

            data = response.json()
            search_results = data.get("query", {}).get("search", [])
            if not search_results:
                _WIKI_CACHE[topic_clean] = None
                return None

            page_title = search_results[0].get("title")
            if not page_title:
                _WIKI_CACHE[topic_clean] = None
                return None

            # Step 2: Fetch the summary for the matched page title
            summary_params = {
                "action": "query",
                "prop": "extracts",
                "exintro": "1",
                "explaintext": "1",
                "exsentences": str(sentences),
                "titles": page_title,
                "format": "json",
                "utf8": "1"
            }
            response = requests.get(search_url, params=summary_params, timeout=1.0)
            if response.status_code != 200:
                _WIKI_CACHE[topic_clean] = None
                return None

            data = response.json()
            pages = data.get("query", {}).get("pages", {})
            if not pages:
                _WIKI_CACHE[topic_clean] = None
                return None

            # Get the page extract
            page_id = list(pages.keys())[0]
            summary = pages[page_id].get("extract", "").strip()

            if summary:
                logger.info(f"Wiki cache miss, successfully fetched summary for topic: {topic_clean}")
                _WIKI_CACHE[topic_clean] = summary
                return summary

        except Exception as e:
            logger.warning(f"Wiki lookup failed or timed out for topic '{topic}': {e}")

        # Store None to prevent retrying slow/failing lookups
        _WIKI_CACHE[topic_clean] = None
        return None

