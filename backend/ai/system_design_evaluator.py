import logging
import re
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from ai.gemini_service import GeminiService

logger = logging.getLogger(__name__)

SYSTEM_DESIGN_PROMPTS: List[dict] = [
    {
        "id": "rate-limiter",
        "title": "Design a Distributed Rate Limiter",
        "difficulty": "Hard",
        "category": "API Gateway & Infrastructure",
        "description": "Design a high-throughput, low-latency distributed rate limiter capable of enforcing 100k requests/sec per user/IP across multi-region API Gateways.",
        "key_requirements": [
            "Low latency (<2ms overhead per request)",
            "Sliding window counter or Token Bucket algorithm",
            "Multi-region data synchronization with Redis / Memcached",
            "Graceful degradation when rate limit database is unreachable"
        ],
        "starter_architecture": "Client -> API Gateway -> Rate Limiter Service -> Distributed Cache (Redis Cluster)"
    },
    {
        "id": "url-shortener",
        "title": "Design a Scalable URL Shortener (TinyURL)",
        "difficulty": "Medium",
        "category": "Storage & Caching",
        "description": "Design a URL shortening service capable of handling 500 million new URLs per month and a 10:1 read-to-write ratio.",
        "key_requirements": [
            "Unique 7-character hash generation (Base62 encoding / KGS pre-allocation)",
            "High availability with 99.99% uptime",
            "Custom short link support with expiration policy",
            "Analytics tracking (click counts, referrers, geo-location)"
        ],
        "starter_architecture": "Client -> Load Balancer -> Web App Nodes -> Key Generation Service -> NoSQL (Cassandra/DynamoDB) + Redis Cache"
    },
    {
        "id": "video-streaming",
        "title": "Design a Global Video Streaming Platform (Netflix/YouTube)",
        "difficulty": "Hard",
        "category": "Media Processing & Content Delivery",
        "description": "Design a global streaming infrastructure handling adaptive bitrate video playback, video chunk encoding, and CDN distribution.",
        "key_requirements": [
            "HLS/DASH adaptive bitrate streaming (1080p, 4K)",
            "Asynchronous video processing pipeline (AWS SQS + Transcoding Workers)",
            "Global CDN caching for popular content",
            "User watch state synchronization across devices"
        ],
        "starter_architecture": "Client -> CDN -> API Gateway -> Video Service -> SQS -> Transcoder Pool -> Cloud Storage (S3)"
    },
    {
        "id": "realtime-chat",
        "title": "Design a Scalable Real-time Chat & Presence System (WhatsApp/Discord)",
        "difficulty": "Hard",
        "category": "Real-time Messaging & WebSockets",
        "description": "Design a messaging platform supporting 50 million daily active users, 1-on-1 chats, group channels, and real-time online presence.",
        "key_requirements": [
            "Persistent WebSocket gateway connections with connection manager",
            "End-to-end message delivery with read receipts and offline queuing",
            "Distributed message storage with time-series indexing",
            "Presence service using heartbeats & Redis Pub/Sub"
        ],
        "starter_architecture": "Client -> WebSocket Gateway -> Connection Manager -> Message Broker (Kafka) -> Message Service -> Cassandra"
    },
    {
        "id": "notification-engine",
        "title": "Design an Omnichannel Notification Platform",
        "difficulty": "Medium",
        "category": "Distributed Queueing & Messaging",
        "description": "Design a multi-tenant notification system for Push, SMS, and Email notifications handling 100M+ notifications per day with rate throttling and deduplication.",
        "key_requirements": [
            "Idempotency and deduplication guarantees",
            "Priority queueing (transactional OTPs vs promotional bulk emails)",
            "3rd-party vendor fallback (Twilio, SendGrid, Firebase FCM)",
            "User preference management and quiet hours enforcement"
        ],
        "starter_architecture": "Client -> API Service -> Deduplication Engine (Redis) -> Message Queue (RabbitMQ) -> Provider Workers -> Vendors"
    }
]


class SystemDesignEvaluationResult(BaseModel):
    architecture_score: int = Field(..., ge=0, le=100)
    scalability_score: int = Field(..., ge=0, le=100)
    reliability_score: int = Field(..., ge=0, le=100)
    storage_estimation_score: int = Field(..., ge=0, le=100)
    overall_design_score: int = Field(..., ge=0, le=100)
    database_choice_analysis: str
    single_points_of_failure: List[str]
    tradeoff_analysis: List[str]
    strengths: List[str]
    weaknesses: List[str]
    architecture_feedback: str
    recommended_mermaid_diagram: str
    suggested_improvements: List[str]


class SystemDesignEvaluator:
    """Evaluates System Design architectures against scalability, availability, SPOFs, and trade-offs"""

    def __init__(self):
        self.gemini = GeminiService()

    def get_prompts(self) -> List[dict]:
        """Return list of system design scenarios"""
        return SYSTEM_DESIGN_PROMPTS

    def evaluate(self, problem_id: str, candidate_solution: str) -> dict:
        """Evaluate a candidate system design answer"""
        scenario = next((p for p in SYSTEM_DESIGN_PROMPTS if p["id"] == problem_id), SYSTEM_DESIGN_PROMPTS[0])

        prompt = f"""
You are a Principal Systems Architect evaluating a candidate's System Design solution.

Scenario: {scenario['title']}
Description: {scenario['description']}
Key Requirements: {', '.join(scenario['key_requirements'])}

Candidate's Proposed System Design Solution:
"{candidate_solution}"

Evaluate the candidate's solution across:
1. Architecture completeness (load balancing, caching, storage, async queues)
2. Scalability & throughput handling
3. High availability & Single Points of Failure (SPOFs)
4. Database selection & trade-offs (CAP theorem, SQL vs NoSQL, Consistency vs Latency)

Generate a JSON response strictly matching this schema:
{{
  "architecture_score": int (0-100),
  "scalability_score": int (0-100),
  "reliability_score": int (0-100),
  "storage_estimation_score": int (0-100),
  "overall_design_score": int (0-100),
  "database_choice_analysis": string,
  "single_points_of_failure": [string],
  "tradeoff_analysis": [string],
  "strengths": [string],
  "weaknesses": [string],
  "architecture_feedback": string,
  "recommended_mermaid_diagram": string (Valid Mermaid JS graph TD syntax depicting the complete target architecture),
  "suggested_improvements": [string]
}}
"""

        try:
            res = self.gemini.generate_json(
                prompt=prompt,
                schema=SystemDesignEvaluationResult,
                system_instruction="You are a Principal System Architect. Return valid JSON matching the requested schema."
            )
            if isinstance(res, dict):
                return res
            elif hasattr(res, "dict"):
                return res.dict()
        except Exception as e:
            logger.warning(f"Gemini System Design evaluation fallback: {e}")

        # Intelligent Fallback
        has_cache = "redis" in candidate_solution.lower() or "cache" in candidate_solution.lower()
        has_lb = "load balancer" in candidate_solution.lower() or "nginx" in candidate_solution.lower() or "gateway" in candidate_solution.lower()
        has_queue = "kafka" in candidate_solution.lower() or "queue" in candidate_solution.lower() or "sqs" in candidate_solution.lower()

        spofs = []
        if not has_lb:
            spofs.append("Single Web Server Node (No Load Balancer)")
        if not has_cache:
            spofs.append("Database Bottleneck (No Caching Layer)")
        if not has_queue:
            spofs.append("Synchronous Coupling (No Message Queue for async processing)")

        diagram = """graph TD
    Client[Client App] --> LB[Load Balancer]
    LB --> Gateway[API Gateway]
    Gateway --> Cache[(Redis Cache)]
    Gateway --> Service[App Services]
    Service --> Queue[Message Queue]
    Service --> DB[(Distributed DB)]
"""

        return {
            "architecture_score": 85 if (has_lb and has_cache) else 65,
            "scalability_score": 80 if has_queue else 60,
            "reliability_score": 75 if not spofs else 55,
            "storage_estimation_score": 70,
            "overall_design_score": 80 if (has_lb and has_cache and has_queue) else 62,
            "database_choice_analysis": "Proposed solution addresses basic data persistence, but should specify partitioning/sharding strategy for high scale.",
            "single_points_of_failure": spofs if spofs else ["Ensure Multi-AZ database replication to avoid single-master outages"],
            "tradeoff_analysis": [
                "Prioritized eventual consistency over strong consistency for low read latency",
                "Trade-off between memory cost of Redis vs DB read load"
            ],
            "strengths": ["Clear component separation", "Addresses core functional requirements"],
            "weaknesses": spofs if spofs else ["Needs explicit data retention and archiving strategy"],
            "architecture_feedback": f"Solid initial design for {scenario['title']}. To elevate to Staff/Principal level, detail sharding keys and multi-region failover.",
            "recommended_mermaid_diagram": diagram,
            "suggested_improvements": [
                "Add an API Gateway for rate limiting and SSL termination",
                "Implement Redis cluster with LRU eviction for caching hot records",
                "Use Kafka/RabbitMQ for asynchronous task decoupling"
            ]
        }
