import logging
import random
from typing import Optional, List, Dict
from ai.gemini_service import GeminiService

logger = logging.getLogger(__name__)


class AnswerEvaluator:
    """Evaluates interview answers using Gemini AI with adaptive scoring"""

    def __init__(self):
        self.gemini = GeminiService()

    def evaluate(
        self,
        question: dict,
        answer: str,
        role: str = "software_engineer",
        voice_metrics: Optional[dict] = None,
        emotion_metrics: Optional[dict] = None,
        previous_scores: Optional[list] = None,
    ) -> dict:
        """Evaluate an answer and return detailed feedback with adaptive fields"""
        if self.gemini.is_available():
            result = self._evaluate_with_gemini(
                question,
                answer,
                role,
                voice_metrics=voice_metrics,
                emotion_metrics=emotion_metrics,
                previous_scores=previous_scores,
            )
            if result:
                return result

        logger.info("Using fallback evaluation")
        return self._fallback_evaluation(
            answer,
            question=question,
            voice_metrics=voice_metrics,
            emotion_metrics=emotion_metrics,
            previous_scores=previous_scores,
        )

    def generate_follow_up(
        self, question: dict, answer: str, evaluation: dict, role: str = "software_engineer"
    ) -> dict:
        """Generate a personalized follow-up question based on the answer"""
        if self.gemini.is_available():
            result = self._follow_up_with_gemini(question, answer, evaluation, role)
            if result:
                return result
        return self._fallback_follow_up(question, evaluation)

    def _evaluate_with_gemini(self, question, answer, role, voice_metrics=None, emotion_metrics=None, previous_scores=None):
        """Evaluate answer using Gemini API"""
        question_text = question.get("text", "") if isinstance(question, dict) else str(question)
        question_type = question.get("type", "technical") if isinstance(question, dict) else "technical"
        category = question.get("category", "General") if isinstance(question, dict) else "General"
        persona_id = question.get("persona_id", "") if isinstance(question, dict) else ""

        persona_context = ""
        if persona_id == "strict_manager":
            persona_context = "\nYou are evaluating as the 'Strict Engineering Manager'. Your feedback should be highly critical, pushing for excellence, measurable outcomes, and challenging weak technical trade-offs. Score strictly."
        elif persona_id == "hr_manager":
            persona_context = "\nYou are evaluating as the 'HR Manager'. Your feedback should be supportive, encouraging, and focus on communication, teamwork, and cultural fit."
        elif persona_id == "technical_lead":
            persona_context = "\nYou are evaluating as the 'Technical Lead'. Your feedback should be direct, analytical, and focused on architectural patterns, code quality, and best practices."

        voice_context = ""
        if voice_metrics:
            voice_context = f"""

Voice Interview Metrics:
{voice_metrics}

Use the delivery signals to inform confidence, clarity, pacing, and speaking style."""

        emotion_context = ""
        if emotion_metrics:
            emotion_context = f"""

Video/Emotion Coaching Signals:
{emotion_metrics}

Use these browser-derived coaching signals to inform eye contact, engagement, and composure feedback. Do not treat them as medical or psychological diagnosis."""

        adaptive_context = ""
        if previous_scores:
            avg = sum(previous_scores) / len(previous_scores)
            adaptive_context = (
                f"\nCandidate's average score so far: {avg:.0f}/100 across {len(previous_scores)} questions."
            )

        prompt = f"""You are an expert technical interviewer evaluating a candidate's response.{persona_context}

Role: {role.replace('_', ' ').title()}
Question Category: {category}
Question Type: {question_type}
{adaptive_context}

Question: {question_text}

Candidate's Answer: {answer}
{voice_context}
{emotion_context}

Evaluate this answer and return a JSON object with these exact fields:
{{
  "technical_score": <0-100>,
  "clarity_score": <0-100>,
  "completeness_score": <0-100>,
  "relevance_score": <0-100, how relevant is the answer to the specific question asked>,
  "depth_score": <0-100, how deep the technical explanation goes>,
  "overall_score": <0-100>,
  "topic": "<main technical topic>",
  "strong_areas": ["<strength 1>", "<strength 2>"],
  "weak_areas": ["<weakness 1>", "<weakness 2>"],
  "feedback": "<2-3 sentences of constructive feedback>",
  "ideal_answer_hints": "<brief hint about what an ideal answer would include>",
  "confidence_score": <0-100>,
  "structure_score": <0-100>,
  "priority_focus": "<single coaching focus for the next answer>",
  "suggested_next_action": "<one concrete action to improve>",
  "follow_up_prompt": "<a follow-up question to dig deeper into a weak area>",
  "coach_notes": ["<coaching note 1>", "<coaching note 2>"],
  "live_tips": ["<real-time coaching tip 1>", "<tip 2>", "<tip 3>"],
  "difficulty_adjustment": "<increase|maintain|decrease> based on answer quality",
  "speaking_pace_wpm": <integer or 0>,
  "filler_word_count": <integer>,
  "filler_word_ratio": <0-100>,
  "voice_delivery_score": <0-100>,
  "voice_feedback": "<short feedback on pacing, fillers, or confidence>",
  "emotion_label": "<focused|calm|energetic|nervous|disengaged|uncertain>",
  "engagement_score": <0-100>,
  "eye_contact_score": <0-100>,
  "emotion_feedback": "<short feedback on eye contact, composure, and camera presence>",
  "sentiment": "positive" | "neutral" | "negative"
}}

Be fair but honest. If the answer is very short or vague, score accordingly."""

        result = self.gemini.generate_json(prompt)
        if result and isinstance(result, dict):
            return self._validate_evaluation(result, voice_metrics=voice_metrics, emotion_metrics=emotion_metrics)

        return None

    def _follow_up_with_gemini(self, question, answer, evaluation, role):
        """Generate follow-up question using Gemini"""
        question_text = question.get("text", "") if isinstance(question, dict) else str(question)
        weak_areas = evaluation.get("weak_areas", [])
        score = evaluation.get("overall_score", 50)

        prompt = f"""You are an interviewer for a {role.replace('_', ' ').title()} role.

Original question: {question_text}
Candidate's answer: {answer}
Score: {score}/100
Weak areas: {', '.join(weak_areas) if weak_areas else 'none identified'}

Generate a follow-up question that:
- Digs deeper into a weak area of their answer
- Tests if they truly understand the concept or just memorized it
- Feels natural, like a real interviewer would ask

Return JSON:
{{
  "text": "<the follow-up question>",
  "category": "<topic category>",
  "type": "technical",
  "difficulty": "{'hard' if score > 70 else 'medium' if score > 40 else 'easy'}",
  "is_follow_up": true,
  "parent_question": "{question_text[:60]}..."
}}"""

        result = self.gemini.generate_json(prompt)
        if result and isinstance(result, dict) and result.get("text"):
            result["is_follow_up"] = True
            return result
        return None

    def _fallback_follow_up(self, question, evaluation):
        """Generate rule-based follow-up question"""
        question_text = question.get("text", "") if isinstance(question, dict) else str(question)
        question_type = question.get("type", "technical") if isinstance(question, dict) else "technical"
        topic = evaluation.get("topic", "this topic")
        score = evaluation.get("overall_score", 50)

        if question_type == "behavioral":
            templates = [
                "What was the measurable outcome of that experience?",
                "Looking back, what would you do differently?",
                "How did that change how you approach similar situations now?",
            ]
        elif question_type == "situational":
            templates = [
                "What would be the first thing you do in the first 30 minutes?",
                "How would you prioritize if you had limited time and resources?",
                "What if the constraint you mentioned was removed — how would your approach change?",
            ]
        else:
            templates = [
                f"Can you go deeper on the technical implementation of {topic}?",
                "What would be the trade-offs of the approach you described?",
                "How would you handle edge cases or failure scenarios in your solution?",
                "Can you walk me through a real example where you applied this?",
            ]

        text = random.choice(templates)
        return {
            "text": text,
            "category": evaluation.get("topic", "Follow-up"),
            "type": question_type,
            "difficulty": "hard" if score > 70 else "medium",
            "is_follow_up": True,
            "parent_question": question_text[:60],
        }

    def _validate_evaluation(
        self,
        result: dict,
        voice_metrics: Optional[dict] = None,
        emotion_metrics: Optional[dict] = None,
    ) -> dict:
        """Validate and normalize evaluation result"""

        def clamp(val, default=50):
            try:
                return max(0, min(100, int(val)))
            except (TypeError, ValueError):
                return default

        tech = clamp(result.get("technical_score", 50))
        clarity = clamp(result.get("clarity_score", 50))
        completeness = clamp(result.get("completeness_score", 50))
        relevance = clamp(result.get("relevance_score", tech))
        depth = clamp(result.get("depth_score", round((tech + completeness) / 2)))
        overall = clamp(
            result.get("overall_score", round(tech * 0.4 + clarity * 0.2 + completeness * 0.2 + relevance * 0.2))
        )
        confidence = clamp(result.get("confidence_score", round((clarity + completeness) / 2)))
        structure = clamp(result.get("structure_score", round((clarity + completeness + tech) / 3)))

        default_pace = int((voice_metrics or {}).get("speaking_pace_wpm") or 0)
        default_filler_count = int((voice_metrics or {}).get("filler_count") or 0)
        default_filler_ratio = clamp((voice_metrics or {}).get("filler_ratio", 0), default=0)
        default_voice_delivery = clamp((voice_metrics or {}).get("delivery_score", 0), default=0)
        default_emotion_label = (emotion_metrics or {}).get("primary_emotion", "uncertain")
        default_engagement_score = clamp((emotion_metrics or {}).get("engagement_score", 0), default=0)
        default_eye_contact_score = clamp((emotion_metrics or {}).get("eye_contact_score", 0), default=0)

        speaking_pace_wpm = max(0, int(result.get("speaking_pace_wpm", default_pace) or default_pace))
        filler_word_count = max(0, int(result.get("filler_word_count", default_filler_count) or default_filler_count))
        filler_word_ratio = clamp(result.get("filler_word_ratio", default_filler_ratio), default=default_filler_ratio)
        voice_delivery_score = clamp(
            result.get("voice_delivery_score", default_voice_delivery), default=default_voice_delivery
        )

        coach_notes = result.get("coach_notes", [])
        if isinstance(coach_notes, str):
            coach_notes = [coach_notes]

        live_tips = result.get("live_tips", [])
        if isinstance(live_tips, str):
            live_tips = [live_tips]

        # Determine difficulty adjustment
        difficulty_adjustment = result.get("difficulty_adjustment", "maintain")
        if difficulty_adjustment not in ("increase", "maintain", "decrease"):
            if overall >= 80:
                difficulty_adjustment = "increase"
            elif overall < 45:
                difficulty_adjustment = "decrease"
            else:
                difficulty_adjustment = "maintain"

        return {
            "technical_score": tech,
            "clarity_score": clarity,
            "completeness_score": completeness,
            "relevance_score": relevance,
            "depth_score": depth,
            "overall_score": overall,
            "topic": result.get("topic", "General"),
            "strong_areas": result.get("strong_areas", [])[:3],
            "weak_areas": result.get("weak_areas", [])[:3],
            "feedback": result.get("feedback", "Good attempt. Keep practicing."),
            "ideal_answer_hints": result.get("ideal_answer_hints", ""),
            "confidence_score": confidence,
            "structure_score": structure,
            "priority_focus": result.get("priority_focus", "Be more specific and use a concrete example."),
            "suggested_next_action": result.get("suggested_next_action", "Rewrite the answer with the STAR method."),
            "follow_up_prompt": result.get(
                "follow_up_prompt", "How would you explain that to a non-technical interviewer?"
            ),
            "coach_notes": coach_notes[:4],
            "live_tips": live_tips[:3],
            "difficulty_adjustment": difficulty_adjustment,
            "speaking_pace_wpm": speaking_pace_wpm,
            "filler_word_count": filler_word_count,
            "filler_word_ratio": filler_word_ratio,
            "voice_delivery_score": voice_delivery_score,
            "voice_feedback": result.get("voice_feedback", "Good voice delivery. Focus on pace and clarity."),
            "emotion_label": result.get("emotion_label", default_emotion_label),
            "engagement_score": clamp(result.get("engagement_score", default_engagement_score), default=default_engagement_score),
            "eye_contact_score": clamp(result.get("eye_contact_score", default_eye_contact_score), default=default_eye_contact_score),
            "emotion_feedback": result.get(
                "emotion_feedback",
                "Maintain steady eye contact, balanced posture, and consistent camera framing.",
            ),
            "sentiment": result.get("sentiment", "neutral"),
        }

    def _fallback_evaluation(
        self,
        answer: str,
        question: dict = None,
        voice_metrics: Optional[dict] = None,
        emotion_metrics: Optional[dict] = None,
        previous_scores: Optional[list] = None,
    ) -> dict:
        """Generate a smart fallback evaluation when Gemini is unavailable"""

        def clamp(val, default=50):
            try:
                return max(0, min(100, int(val)))
            except (TypeError, ValueError):
                return default

        word_count = len(answer.split())
        lower = answer.lower()

        # Detect answer quality signals
        has_example = any(
            w in lower for w in ["for example", "for instance", "in my", "we built", "project", "implementation"]
        )
        has_structure = any(
            w in lower for w in ["first", "then", "finally", "as a result", "situation", "task", "action", "result"]
        )
        has_numbers = bool(__import__("re").search(r"\d+%?|\$\d+", answer))
        has_tradeoff = any(
            w in lower for w in ["trade-off", "tradeoff", "downside", "however", "on the other hand", "alternative"]
        )

        if word_count < 10:
            tech, clarity, completeness = 20, 30, 20
            feedback = "Your answer is too brief. Try to elaborate with examples and technical details."
        elif word_count < 30:
            tech, clarity, completeness = 45, 55, 40
            feedback = "Your answer shows basic understanding. Consider adding more depth and concrete examples."
        elif word_count < 80:
            tech, clarity, completeness = 65, 70, 60
            feedback = "Good answer with reasonable depth. Try to include specific examples from your experience."
        else:
            tech, clarity, completeness = 75, 70, 80
            feedback = "Thorough response. Make sure your answers stay focused and highlight key technical concepts."

        # Bonus points for quality signals
        if has_example:
            tech += 5
            completeness += 5
        if has_structure:
            clarity += 8
        if has_numbers:
            tech += 5
            completeness += 3
        if has_tradeoff:
            tech += 7

        jitter = random.randint(-5, 5)
        tech = max(0, min(100, tech + jitter))
        clarity = max(0, min(100, clarity + jitter))
        completeness = max(0, min(100, completeness + jitter))
        relevance = max(0, min(100, round(tech * 0.7 + completeness * 0.3) + random.randint(-3, 3)))
        depth = max(0, min(100, round((tech + completeness) / 2) + random.randint(-3, 3)))
        overall = round(tech * 0.4 + clarity * 0.2 + completeness * 0.2 + relevance * 0.2)

        speaking_pace_wpm = int((voice_metrics or {}).get("speaking_pace_wpm") or 0)
        filler_word_count = int((voice_metrics or {}).get("filler_count") or 0)
        filler_word_ratio = clamp((voice_metrics or {}).get("filler_ratio", 0), default=0)
        voice_delivery_score = clamp((voice_metrics or {}).get("delivery_score", 0), default=0)
        emotion_label = (emotion_metrics or {}).get("primary_emotion", "uncertain")
        engagement_score = clamp((emotion_metrics or {}).get("engagement_score", 0), default=0)
        eye_contact_score = clamp((emotion_metrics or {}).get("eye_contact_score", 0), default=0)

        # Adaptive difficulty
        if previous_scores and len(previous_scores) > 0:
            avg_prev = sum(previous_scores) / len(previous_scores)
            if avg_prev >= 80:
                difficulty_adjustment = "increase"
            elif avg_prev < 45:
                difficulty_adjustment = "decrease"
            else:
                difficulty_adjustment = "maintain"
        else:
            difficulty_adjustment = "maintain"

        # Generate coaching tips
        live_tips = []
        if not has_example:
            live_tips.append("Add a specific example from your experience")
        if not has_structure:
            live_tips.append("Structure your answer with a clear beginning, middle, and end")
        if not has_numbers:
            live_tips.append("Include metrics or numbers to quantify your impact")
        if filler_word_count > 5:
            live_tips.append("Reduce filler words for clearer delivery")

        # Strong/weak areas
        strong = []
        weak = []
        if has_example:
            strong.append("Uses real examples")
        if has_structure:
            strong.append("Well-structured response")
        if has_numbers:
            strong.append("Quantified impact")
        if word_count >= 50:
            strong.append("Good depth")
        if not has_example:
            weak.append("Needs concrete examples")
        if not has_structure:
            weak.append("Improve answer structure")
        if word_count < 30:
            weak.append("Too brief")
        if not has_tradeoff and word_count > 20:
            weak.append("Discuss trade-offs")

        return {
            "technical_score": tech,
            "clarity_score": clarity,
            "completeness_score": completeness,
            "relevance_score": relevance,
            "depth_score": depth,
            "overall_score": overall,
            "topic": (question or {}).get("category", "General") if isinstance(question, dict) else "General",
            "strong_areas": strong[:3] or ["Attempt made"],
            "weak_areas": weak[:3] or ["Add more detail"],
            "feedback": feedback,
            "ideal_answer_hints": "Structure your answer with: context, approach, implementation, and outcome.",
            "confidence_score": clamp(clarity + random.randint(-5, 5), 50),
            "structure_score": clamp((clarity + completeness) / 2 + (10 if has_structure else 0), 50),
            "priority_focus": "Use a clear structure and add one example with measurable impact.",
            "suggested_next_action": "Try a STAR response: situation, task, action, result.",
            "follow_up_prompt": "Walk me through one project where you solved a hard problem.",
            "coach_notes": [
                "Open with the context in one sentence.",
                "Add a concrete example or metric to strengthen credibility.",
                "Close with the result and what you learned.",
            ],
            "live_tips": live_tips[:3],
            "difficulty_adjustment": difficulty_adjustment,
            "speaking_pace_wpm": speaking_pace_wpm,
            "filler_word_count": filler_word_count,
            "filler_word_ratio": filler_word_ratio,
            "voice_delivery_score": voice_delivery_score if voice_metrics else clamp((clarity + completeness) / 2, 50),
            "voice_feedback": (
                "Good voice delivery. Keep your pace steady and reduce filler words."
                if voice_metrics
                else "Focus on pace and reducing filler words."
            ),
            "emotion_label": emotion_label,
            "engagement_score": engagement_score,
            "eye_contact_score": eye_contact_score,
            "emotion_feedback": (
                "Strong camera presence. Keep your gaze steady and posture composed."
                if engagement_score >= 70
                else "Improve camera presence by facing the camera, reducing excess movement, and keeping lighting clear."
            ),
            "sentiment": "positive" if overall >= 70 else "neutral" if overall >= 45 else "negative",
        }
