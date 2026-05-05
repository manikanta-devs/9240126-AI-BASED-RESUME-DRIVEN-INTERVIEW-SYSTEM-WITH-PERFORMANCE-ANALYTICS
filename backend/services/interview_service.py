import json
import os
import logging
from datetime import datetime
from typing import Optional, Dict, List

logger = logging.getLogger(__name__)

DATA_FILE = 'data/sessions.json'


class InterviewService:
    """Manages interview sessions with JSON persistence"""

    def __init__(self):
        self._sessions: dict = {}
        self._load_from_disk()

    def _load_from_disk(self):
        """Load existing sessions from JSON"""
        try:
            if os.path.exists(DATA_FILE):
                with open(DATA_FILE, 'r') as f:
                    self._sessions = json.load(f)
                logger.info(f"Loaded {len(self._sessions)} sessions from disk")
        except Exception as e:
            logger.error(f"Failed to load sessions: {e}")
            self._sessions = {}

    def _save_to_disk(self):
        """Persist sessions to JSON"""
        try:
            os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
            with open(DATA_FILE, 'w') as f:
                json.dump(self._sessions, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Failed to save sessions: {e}")

    def create_session(self, session_id, questions, resume_data,
                       role, candidate_name, interview_format='voice', difficulty='medium', panel_mode=False):
        """Create a new interview session"""
        session = {
            'id': session_id,
            'candidate_name': candidate_name,
            'role': role,
            'interview_format': interview_format,
            'difficulty': difficulty,
            'panel_mode': panel_mode,
            'questions': questions,
            'answers': [],
            'resume_data': resume_data,
            'status': 'active',
            'started_at': datetime.utcnow().isoformat(),
            'completed_at': None,
            'results': None
        }
        self._sessions[session_id] = session
        self._save_to_disk()
        return session

    def get_session(self, session_id):
        """Retrieve a session by ID"""
        return self._sessions.get(session_id)

    def add_answer(self, session_id, answer_data):
        """Add an answer to a session"""
        session = self._sessions.get(session_id)
        if not session:
            return False
        answer_data['timestamp'] = datetime.utcnow().isoformat()
        session['answers'].append(answer_data)
        self._save_to_disk()
        return True

    def complete_session(self, session_id):
        """Complete an interview and compute aggregate results"""
        session = self._sessions.get(session_id)
        if not session:
            raise ValueError("Session not found")

        answers = session.get('answers', [])
        if not answers:
            raise ValueError("No answers submitted")

        # Aggregate scores
        tech_scores = []
        clarity_scores = []
        completeness_scores = []
        relevance_scores = []
        depth_scores = []
        voice_delivery_scores = []
        speaking_paces = []
        filler_word_counts = []
        filler_word_ratios = []
        weak_areas = []
        strong_areas = []
        difficulty_history = []
        topic_scores = {}

        for ans in answers:
            ev = ans.get('evaluation', {})
            if ev.get('technical_score'):
                tech_scores.append(ev['technical_score'])
            if ev.get('clarity_score'):
                clarity_scores.append(ev['clarity_score'])
            if ev.get('completeness_score'):
                completeness_scores.append(ev['completeness_score'])
            if ev.get('relevance_score'):
                relevance_scores.append(ev['relevance_score'])
            if ev.get('depth_score'):
                depth_scores.append(ev['depth_score'])
            if ev.get('voice_delivery_score') is not None:
                voice_delivery_scores.append(ev['voice_delivery_score'])
            if ev.get('speaking_pace_wpm'):
                speaking_paces.append(ev['speaking_pace_wpm'])
            if ev.get('filler_word_count') is not None:
                filler_word_counts.append(ev['filler_word_count'])
            if ev.get('filler_word_ratio') is not None:
                filler_word_ratios.append(ev['filler_word_ratio'])
            if ev.get('weak_areas'):
                weak_areas.extend(ev['weak_areas'])
            if ev.get('strong_areas'):
                strong_areas.extend(ev['strong_areas'])
            if ev.get('difficulty_adjustment'):
                difficulty_history.append(ev['difficulty_adjustment'])

            # Track per-topic scores for skill gap report
            topic = ev.get('topic') or ans.get('question', {}).get('category', 'General')
            if topic not in topic_scores:
                topic_scores[topic] = []
            if ev.get('overall_score'):
                topic_scores[topic].append(ev['overall_score'])

        safe_avg = lambda lst: round(sum(lst) / len(lst), 1) if lst else 0

        avg_tech = safe_avg(tech_scores)
        avg_clarity = safe_avg(clarity_scores)
        avg_completeness = safe_avg(completeness_scores)
        avg_relevance = safe_avg(relevance_scores)
        avg_depth = safe_avg(depth_scores)
        avg_voice_delivery = safe_avg(voice_delivery_scores)
        avg_pace = safe_avg(speaking_paces)
        avg_filler_ratio = safe_avg(filler_word_ratios)
        total_fillers = sum(filler_word_counts) if filler_word_counts else 0

        overall = round((avg_tech * 0.4 + avg_clarity * 0.2 + avg_completeness * 0.2 + avg_relevance * 0.2), 1)

        grade_map = [(90, 'A+'), (80, 'A'), (70, 'B+'), (60, 'B'), (50, 'C+'), (0, 'C')]
        grade = next(g for threshold, g in grade_map if overall >= threshold)

        # Build skill gaps
        skill_gaps = []
        for topic, scores in topic_scores.items():
            avg = round(sum(scores) / len(scores), 1)
            recommendation = 'Strong' if avg >= 70 else 'Review needed' if avg >= 50 else 'Study required'
            skill_gaps.append({
                'topic': topic,
                'score': avg,
                'count': len(scores),
                'recommendation': recommendation
            })
        skill_gaps.sort(key=lambda x: x['score'])

        results = {
            'session_id': session_id,
            'candidate_name': session['candidate_name'],
            'role': session['role'],
            'total_questions': len(session['questions']),
            'answered_questions': len(answers),
            'scores': {
                'overall': overall,
                'technical': avg_tech,
                'clarity': avg_clarity,
                'completeness': avg_completeness,
                'relevance': avg_relevance,
                'depth': avg_depth,
            },
            'voice': {
                'delivery': avg_voice_delivery,
                'speaking_pace_wpm': avg_pace,
                'filler_word_ratio': avg_filler_ratio,
                'filler_word_count': total_fillers,
            },
            'grade': grade,
            'interview_format': session.get('interview_format', 'voice'),
            'weak_areas': list(set(weak_areas))[:5],
            'strong_areas': list(set(strong_areas))[:5],
            'skill_gaps': skill_gaps,
            'difficulty_history': difficulty_history,
            'answers': answers,
            'started_at': session['started_at'],
            'completed_at': datetime.utcnow().isoformat(),
            'duration_minutes': self._calc_duration(session['started_at'])
        }

        session['status'] = 'completed'
        session['completed_at'] = results['completed_at']
        session['results'] = results
        self._save_to_disk()
        return results

    def _calc_duration(self, start_iso: str) -> int:
        """Calculate interview duration in minutes"""
        try:
            start = datetime.fromisoformat(start_iso)
            diff = datetime.utcnow() - start
            return max(1, int(diff.total_seconds() / 60))
        except Exception:
            return 0

    def get_all_sessions(self):
        """Get all sessions (summary only)"""
        summaries = []
        for s in self._sessions.values():
            summaries.append({
                'id': s['id'],
                'candidate_name': s.get('candidate_name', 'Unknown'),
                'role': s.get('role', 'N/A'),
                'interview_format': s.get('interview_format', 'voice'),
                'status': s.get('status', 'unknown'),
                'started_at': s.get('started_at'),
                'completed_at': s.get('completed_at'),
                'overall_score': s.get('results', {}).get('scores', {}).get('overall') if s.get('results') else None
            })
        return sorted(summaries, key=lambda x: x.get('started_at', ''), reverse=True)

    def delete_session(self, session_id):
        """Delete a session"""
        if session_id in self._sessions:
            del self._sessions[session_id]
            self._save_to_disk()
