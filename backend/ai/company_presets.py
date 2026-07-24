import logging
from typing import Dict, List, Optional
from ai.gemini_service import GeminiService

logger = logging.getLogger(__name__)

COMPANY_PRESETS: Dict[str, dict] = {
    "amazon": {
        "id": "amazon",
        "name": "Amazon",
        "badge": "16 Leadership Principles",
        "description": "Deeply evaluates Amazon's 16 Leadership Principles (Customer Obsession, Ownership, Invent & Simplify, Bias for Action, etc.) with bar-raiser follow-ups.",
        "principles": [
            "Customer Obsession",
            "Ownership",
            "Invent and Simplify",
            "Are Right, A Lot",
            "Learn and Be Curious",
            "Hire and Develop the Best",
            "Insist on the Highest Standards",
            "Think Big",
            "Bias for Action",
            "Frugality",
            "Earn Trust",
            "Dive Deep",
            "Have Backbone; Disagree and Commit",
            "Deliver Results",
            "Strive to be Earth's Best Employer",
            "Success and Scale Bring Broad Responsibility"
        ],
        "interviewer_persona": "Sarah Chen (Bar Raiser)",
        "rubric_focus": "STAR format, quantitative metrics, ownership, customer impact",
        "color_theme": "amber"
    },
    "google": {
        "id": "google",
        "name": "Google",
        "badge": "Googleyness & Scale",
        "description": "Focuses on Googleyness, General Cognitive Ability (GCA), Role-Related Knowledge (RRK), and planetary-scale system architecture.",
        "principles": [
            "Googleyness (Navigating Ambiguity, Intellectual Humility, Doing the Right Thing)",
            "General Cognitive Ability (GCA)",
            "Planetary Scale System Architecture",
            "Algorithmic Efficiency (Big-O Optimization)",
            "Collaborative Problem Solving"
        ],
        "interviewer_persona": "Alex Rivera (Staff Engineer & GCA Lead)",
        "rubric_focus": "Algorithmic rigor, scalability, trade-off analysis, cognitive ability",
        "color_theme": "blue"
    },
    "meta": {
        "id": "meta",
        "name": "Meta",
        "badge": "Move Fast & Build",
        "description": "Evaluates speed of execution, pragmatic system design, high product impact, and Meta's core cultural values.",
        "principles": [
            "Move Fast",
            "Focus on Long-Term Impact",
            "Build Awesome Things",
            "Live in the Future",
            "Be Direct & Respect Your Colleagues",
            "Meta, Metamates, Me"
        ],
        "interviewer_persona": "Marcus Vance (Engineering Director)",
        "rubric_focus": "Product sense, code velocity, architecture scalability, direct communication",
        "color_theme": "indigo"
    },
    "netflix": {
        "id": "netflix",
        "name": "Netflix",
        "badge": "Freedom & Responsibility",
        "description": "Evaluates Netflix Culture Memo pillars: Context Not Control, High Performance, Highly Aligned, Loosely Coupled.",
        "principles": [
            "Freedom and Responsibility",
            "Context, Not Control",
            "High Performance Culture",
            "Uncompromising Selflessness",
            "Stunning Colleagues"
        ],
        "interviewer_persona": "Elena Rostova (Principal Architect)",
        "rubric_focus": "Self-direction, context decision making, high responsibility, architectural clarity",
        "color_theme": "red"
    },
    "microsoft": {
        "id": "microsoft",
        "name": "Microsoft",
        "badge": "Growth Mindset",
        "description": "Evaluates growth mindset, empathy, cross-team collaboration, and enterprise platform engineering.",
        "principles": [
            "Growth Mindset & Continuous Learning",
            "Customer-Centricity",
            "One Microsoft Collaboration",
            "Diverse & Inclusive Leadership"
        ],
        "interviewer_persona": "David Miller (Partner Architect)",
        "rubric_focus": "Adaptability, enterprise reliability, collaborative problem solving",
        "color_theme": "cyan"
    },
    "apple": {
        "id": "apple",
        "name": "Apple",
        "badge": "Precision & Craft",
        "description": "Focuses on deep technical mastery, hardware-software integration, precision craft, and confidentiality.",
        "principles": [
            "Deep Technical Excellence",
            "Uncompromising Attention to Detail",
            "Cross-Functional Craftsmanship",
            "Innovation & User Perfection"
        ],
        "interviewer_persona": "Jonathan Ivy (Senior Distinguished Engineer)",
        "rubric_focus": "Code cleanlines, resource optimization, detailed domain knowledge",
        "color_theme": "slate"
    },
    "startup": {
        "id": "startup",
        "name": "Top Tech Startup",
        "badge": "Full-Stack Ownership",
        "description": "Evaluates 0-to-1 build capability, rapid prototyping, resourcefulness, and product-market urgency.",
        "principles": [
            "0-to-1 Resourcefulness",
            "Full-Stack Autonomy",
            "Customer Velocity",
            "Pragmatic Engineering"
        ],
        "interviewer_persona": "Rachel Cole (Co-founder & CTO)",
        "rubric_focus": "Ship speed, trade-off pragmatism, full-stack independence",
        "color_theme": "emerald"
    }
}


class CompanyPresetEngine:
    """Manages company-specific interview prompts, principles, and rubrics"""

    def __init__(self):
        self.gemini = GeminiService()

    def get_companies(self) -> List[dict]:
        """Return list of supported company presets"""
        return list(COMPANY_PRESETS.values())

    def get_company(self, company_id: str) -> Optional[dict]:
        """Get details for a specific company preset"""
        return COMPANY_PRESETS.get(company_id.lower())

    def generate_company_questions(self, company_id: str, role: str, num_questions: int = 5) -> List[dict]:
        """Generate questions strictly tailored to company culture and principles"""
        preset = self.get_company(company_id)
        if not preset:
            preset = COMPANY_PRESETS["amazon"]

        prompt = f"""
You are {preset['interviewer_persona']} interviewing a candidate for a {role} position at {preset['name']}.
Generate {num_questions} interview questions strictly aligned with {preset['name']}'s core principles:
{', '.join(preset['principles'])}

Evaluation Focus: {preset['rubric_focus']}

Return a valid JSON array of question objects where each question has:
- id: integer (1 to {num_questions})
- text: string (the actual question string incorporating {preset['name']} principles)
- topic: string (e.g. {preset['principles'][0]})
- company: string ("{preset['name']}")
- principle: string (which principle this question tests)
- difficulty: string ("medium" or "hard")
- ideal_answer_hints: string (what {preset['name']} look for in a top candidate response)
"""

        try:
            res = self.gemini.generate_json(
                prompt=prompt,
                system_instruction=f"You are a Bar-Raiser interviewer at {preset['name']}. Return a JSON array of company-specific questions."
            )
            if isinstance(res, list) and len(res) > 0:
                return res
        except Exception as e:
            logger.warning(f"Company question generation fallthrough: {e}")

        # Fallback question generation
        fallback_questions = []
        for i in range(min(num_questions, len(preset["principles"]))):
            principle = preset["principles"][i]
            fallback_questions.append({
                "id": i + 1,
                "text": f"Tell me about a time when you demonstrated {principle} in a challenging project at your previous role.",
                "topic": principle,
                "company": preset["name"],
                "principle": principle,
                "difficulty": "medium",
                "ideal_answer_hints": f"State clear situation, specific actions taken showing {principle}, and quantifiable outcomes."
            })
        return fallback_questions
