import json
import os
import logging
from collections import defaultdict

logger = logging.getLogger(__name__)
DATA_FILE = "data/sessions.json"


class AnalyticsService:
    """Computes analytics from stored interview sessions"""

    def _load_sessions(self) -> dict:
        """Load all sessions from disk"""
        try:
            if os.path.exists(DATA_FILE):
                with open(DATA_FILE, "r") as f:
                    return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load sessions: {e}")
        return {}

    def get_all_sessions(self, limit: int = 20) -> list:
        """Get all sessions with results"""
        sessions = self._load_sessions()
        completed = [s for s in sessions.values() if s.get("status") == "completed" and s.get("results")]
        completed.sort(key=lambda x: x.get("completed_at", ""), reverse=True)
        return [self._session_summary(s) for s in completed[:limit]]

    def get_session_details(self, session_id: str) -> dict:
        """Get full details for a session"""
        sessions = self._load_sessions()
        return sessions.get(session_id)

    def get_summary(self) -> dict:
        """Get overall performance summary"""
        sessions = self._load_sessions()
        completed = [s for s in sessions.values() if s.get("status") == "completed" and s.get("results")]

        if not completed:
            return {
                "total_sessions": 0,
                "avg_overall": 0,
                "avg_technical": 0,
                "avg_clarity": 0,
                "best_score": 0,
                "worst_score": 0,
                "most_common_role": None,
                "improvement_rate": 0,
            }

        scores_overall = [s["results"]["scores"]["overall"] for s in completed]
        scores_tech = [s["results"]["scores"]["technical"] for s in completed]
        scores_clarity = [s["results"]["scores"]["clarity"] for s in completed]
        roles = [s.get("role", "unknown") for s in completed]

        role_count = defaultdict(int)
        for r in roles:
            role_count[r] += 1
        most_common = max(role_count, key=role_count.get) if role_count else None

        # Improvement: compare first half vs second half
        improvement = 0
        if len(scores_overall) >= 4:
            mid = len(scores_overall) // 2
            first_avg = sum(scores_overall[:mid]) / mid
            second_avg = sum(scores_overall[mid:]) / len(scores_overall[mid:])
            improvement = round(second_avg - first_avg, 1)

        return {
            "total_sessions": len(completed),
            "avg_overall": round(sum(scores_overall) / len(scores_overall), 1),
            "avg_technical": round(sum(scores_tech) / len(scores_tech), 1),
            "avg_clarity": round(sum(scores_clarity) / len(scores_clarity), 1),
            "best_score": max(scores_overall),
            "worst_score": min(scores_overall),
            "most_common_role": most_common,
            "improvement_rate": improvement,
        }

    def get_performance_trend(self) -> list:
        """Get performance over time"""
        sessions = self._load_sessions()
        completed = [s for s in sessions.values() if s.get("status") == "completed" and s.get("results")]
        completed.sort(key=lambda x: x.get("completed_at", ""))
        trend = []
        for i, s in enumerate(completed):
            results = s["results"]
            trend.append(
                {
                    "session_number": i + 1,
                    "date": s.get("completed_at", "")[:10],
                    "overall": results["scores"]["overall"],
                    "technical": results["scores"]["technical"],
                    "clarity": results["scores"]["clarity"],
                    "completeness": results["scores"].get("completeness", 0),
                    "role": s.get("role", "unknown"),
                }
            )
        return trend

    def get_weak_areas(self) -> list:
        """Aggregate weak areas across sessions"""
        sessions = self._load_sessions()
        area_count = defaultdict(int)
        for s in sessions.values():
            if s.get("results") and s["results"].get("weak_areas"):
                for area in s["results"]["weak_areas"]:
                    area_count[area] += 1
        sorted_areas = sorted(area_count.items(), key=lambda x: x[1], reverse=True)
        return [{"area": k, "count": v} for k, v in sorted_areas[:10]]

    def get_skill_breakdown(self) -> list:
        """Get skill-wise performance analysis"""
        sessions = self._load_sessions()
        skill_scores = defaultdict(list)

        for s in sessions.values():
            if not (s.get("status") == "completed" and s.get("answers")):
                continue
            for ans in s.get("answers", []):
                ev = ans.get("evaluation", {})
                topic = ev.get("topic", "General")
                if ev.get("technical_score"):
                    skill_scores[topic].append(ev["technical_score"])

        breakdown = []
        for skill, scores in skill_scores.items():
            breakdown.append(
                {"skill": skill, "avg_score": round(sum(scores) / len(scores), 1), "attempts": len(scores)}
            )
        return sorted(breakdown, key=lambda x: x["avg_score"], reverse=True)

    def get_study_plan(self) -> dict:
        """Generate a lightweight practice plan from analytics signals."""
        sessions = self._load_sessions()
        completed = [s for s in sessions.values() if s.get("status") == "completed" and s.get("results")]

        if not completed:
            return {
                "focus_areas": ["Start with one full interview to generate personalized practice areas."],
                "plan_title": "Launch your baseline",
                "weekly_goal": "Complete one interview and review the results.",
                "habits": [
                    "Practice one 2-minute answer out loud every day.",
                    "Review the highest-scoring question and explain why it worked.",
                    "Rewrite one weak answer with stronger structure and detail.",
                ],
                "days": [
                    {"day": "Day 1", "focus": "Set your baseline", "task": "Complete a mock interview."},
                    {"day": "Day 2", "focus": "Review feedback", "task": "Rewrite one weak answer."},
                    {"day": "Day 3", "focus": "Structure", "task": "Practice STAR answers for 20 minutes."},
                    {"day": "Day 4", "focus": "Technical depth", "task": "Explain one system design concept aloud."},
                    {"day": "Day 5", "focus": "Clarity", "task": "Record one answer and tighten it."},
                    {"day": "Day 6", "focus": "Weak areas", "task": "Study one weak topic from the interview."},
                    {"day": "Day 7", "focus": "Retest", "task": "Run another mock interview."},
                ],
            }

        weak_area_count = defaultdict(int)
        topic_scores = defaultdict(list)
        overall_scores = []
        role_count = defaultdict(int)

        for session in completed:
            role_count[session.get("role", "unknown")] += 1
            results = session.get("results", {})
            scores = results.get("scores", {})
            overall_scores.append(scores.get("overall", 0))
            for ans in session.get("answers", []):
                evaluation = ans.get("evaluation", {})
                topic = evaluation.get("topic", "General")
                if evaluation.get("technical_score") is not None:
                    topic_scores[topic].append(evaluation["technical_score"])
                for weak in evaluation.get("weak_areas", []) or []:
                    weak_area_count[weak] += 1

        top_weak = [item[0] for item in sorted(weak_area_count.items(), key=lambda x: x[1], reverse=True)[:3]]
        weakest_topics = sorted(
            (
                {"topic": topic, "avg": round(sum(scores) / len(scores), 1)}
                for topic, scores in topic_scores.items()
                if scores
            ),
            key=lambda x: x["avg"],
        )[:3]

        avg_overall = round(sum(overall_scores) / len(overall_scores), 1) if overall_scores else 0
        biggest_focus = top_weak[0] if top_weak else "answer structure"
        plan_title = "Sharpen your weakest signals" if avg_overall < 70 else "Push from good to great"

        days = [
            {
                "day": "Day 1",
                "focus": "Answer structure",
                "task": f"Rewrite one answer using STAR and emphasize {biggest_focus}.",
            },
            {
                "day": "Day 2",
                "focus": "Technical depth",
                "task": f'Explain the lowest-scoring topic: {weakest_topics[0]["topic"] if weakest_topics else "General"}.',
            },
            {
                "day": "Day 3",
                "focus": "Clarity",
                "task": "Record a 90-second answer and remove filler words.",
            },
            {
                "day": "Day 4",
                "focus": "Confidence",
                "task": "Practice a strong opening and closing sentence for three answers.",
            },
            {
                "day": "Day 5",
                "focus": "Weak area drill",
                "task": f"Create two bullet points for {biggest_focus} and connect them to a project.",
            },
            {
                "day": "Day 6",
                "focus": "Role alignment",
                "task": f'Review interview questions for {max(role_count, key=role_count.get) if role_count else "your target role"}.',
            },
            {
                "day": "Day 7",
                "focus": "Retest",
                "task": "Run another mock interview and compare the score delta.",
            },
        ]

        habits = [
            "Spend 10 minutes daily answering one question out loud.",
            "Convert every weak area into one concrete bullet point.",
            "Keep a short log of score changes after each session.",
        ]

        return {
            "plan_title": plan_title,
            "weekly_goal": f"Improve overall score from {avg_overall}% by focusing on {biggest_focus}.",
            "focus_areas": top_weak or ["Answer structure", "Clarity", "Technical depth"],
            "weakest_topics": weakest_topics,
            "habits": habits,
            "days": days,
            "avg_overall": avg_overall,
        }

    def get_communication_coach(self) -> dict:
        """Generate a communication-first coaching plan from interview history."""
        sessions = self._load_sessions()
        completed = [s for s in sessions.values() if s.get("status") == "completed" and s.get("results")]

        if not completed:
            return {
                "headline": "Build your speaking confidence first",
                "summary": "Start with one short practice interview to unlock personalized communication coaching.",
                "focus_modes": ["Clarity", "Confidence", "Structure"],
                "daily_drills": [
                    "Speak for 60 seconds about yourself without stopping.",
                    "Answer one STAR question and keep it under 90 seconds.",
                    "Record one answer and remove filler words like um or like.",
                ],
                "speaking_rules": [
                    "Open with a direct answer first.",
                    "Use one example, one result, one takeaway.",
                    "Pause before the key point instead of filling with noise.",
                ],
                "weak_signals": ["No interview data yet"],
                "practice_tracks": [
                    {"title": "Self-introduction", "goal": "Sound clear and confident in 30 seconds."},
                    {"title": "Project story", "goal": "Explain impact with one strong example."},
                    {"title": "Difficult question", "goal": "Stay calm when you do not know everything."},
                ],
            }

        voice_scores = []
        clarity_scores = []
        confidence_scores = []
        structure_scores = []
        filler_counts = []
        common_weak = defaultdict(int)

        for session in completed:
            for answer in session.get("answers", []):
                ev = answer.get("evaluation", {})
                if ev.get("voice_delivery_score") is not None:
                    voice_scores.append(ev["voice_delivery_score"])
                if ev.get("clarity_score") is not None:
                    clarity_scores.append(ev["clarity_score"])
                if ev.get("confidence_score") is not None:
                    confidence_scores.append(ev["confidence_score"])
                if ev.get("structure_score") is not None:
                    structure_scores.append(ev["structure_score"])
                if ev.get("filler_word_count") is not None:
                    filler_counts.append(ev["filler_word_count"])
                for weak in ev.get("weak_areas", []) or []:
                    common_weak[weak] += 1

        avg_voice = round(sum(voice_scores) / len(voice_scores), 1) if voice_scores else 0
        avg_clarity = round(sum(clarity_scores) / len(clarity_scores), 1) if clarity_scores else 0
        avg_confidence = round(sum(confidence_scores) / len(confidence_scores), 1) if confidence_scores else 0
        avg_structure = round(sum(structure_scores) / len(structure_scores), 1) if structure_scores else 0
        total_fillers = sum(filler_counts) if filler_counts else 0
        top_weak = [name for name, _count in sorted(common_weak.items(), key=lambda item: item[1], reverse=True)[:3]]

        headline = (
            "Speak with clarity, confidence, and structure" if avg_clarity >= 60 else "Build stronger speaking habits"
        )
        summary = (
            f"Your average voice delivery is {avg_voice}%, clarity is {avg_clarity}%, "
            f"confidence is {avg_confidence}%, and structure is {avg_structure}%. "
            f"You have logged {total_fillers} filler words across practice sessions."
        )

        return {
            "headline": headline,
            "summary": summary,
            "focus_modes": [
                "Clarity" if avg_clarity < 70 else "Polish",
                "Confidence" if avg_confidence < 70 else "Presence",
                "Structure" if avg_structure < 75 else "Conciseness",
            ],
            "daily_drills": [
                "Answer one question in 45 seconds using the point-example-close pattern.",
                "Record a response and remove every filler word you catch.",
                "Practice one answer where you pause before the result or metric.",
            ],
            "speaking_rules": [
                "Start with the conclusion, not the story.",
                "Use one project, one metric, and one takeaway.",
                "Keep your answer short enough to stay focused but long enough to prove depth.",
            ],
            "weak_signals": top_weak or ["Clarity", "Conciseness", "Confidence"],
            "practice_tracks": [
                {"title": "30-second introduction", "goal": "Sound confident and structured."},
                {"title": "Project explanation", "goal": "Show impact without rambling."},
                {"title": "Behavioral answer", "goal": "Use STAR and speak naturally."},
                {"title": "Pressure question", "goal": "Stay calm and answer in a logical order."},
            ],
        }

    def _session_summary(self, session: dict) -> dict:
        """Create a summary dict for a session"""
        results = session.get("results", {})
        scores = results.get("scores", {})
        return {
            "id": session["id"],
            "candidate_name": session.get("candidate_name", "Unknown"),
            "role": session.get("role", "N/A"),
            "grade": results.get("grade", "N/A"),
            "overall_score": scores.get("overall", 0),
            "technical_score": scores.get("technical", 0),
            "clarity_score": scores.get("clarity", 0),
            "total_questions": results.get("total_questions", 0),
            "answered_questions": results.get("answered_questions", 0),
            "duration_minutes": results.get("duration_minutes", 0),
            "completed_at": session.get("completed_at"),
            "weak_areas": results.get("weak_areas", []),
            "strong_areas": results.get("strong_areas", []),
        }

    def clear_all(self):
        """Clear all data"""
        try:
            if os.path.exists(DATA_FILE):
                os.remove(DATA_FILE)
        except Exception as e:
            logger.error(f"Failed to clear data: {e}")
