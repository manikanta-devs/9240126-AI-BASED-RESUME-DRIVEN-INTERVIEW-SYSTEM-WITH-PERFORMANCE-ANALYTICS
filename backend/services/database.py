"""SQLite database layer for interview session persistence."""

import sqlite3
import json
import os
import logging
import threading
from config import get_config

logger = logging.getLogger(__name__)
config = get_config()
DB_PATH = config.DATABASE_FILE

_local = threading.local()


def _get_conn() -> sqlite3.Connection:
    """Return a thread-local SQLite connection."""
    if not hasattr(_local, "conn") or _local.conn is None:
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        _local.conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        _local.conn.execute("PRAGMA journal_mode=WAL")
        _local.conn.execute("PRAGMA foreign_keys=ON")
        _local.conn.row_factory = sqlite3.Row
    return _local.conn


def init_db():
    """Create tables if they do not exist."""
    conn = _get_conn()
    
    # Schema check/migration: if old table contains "questions" column, drop it
    try:
        cursor = conn.execute("PRAGMA table_info(sessions)")
        columns = [c[1] for c in cursor.fetchall()]
        if columns and "questions" in columns:
            logger.info("Detected old database schema. Dropping old tables...")
            conn.execute("DROP TABLE IF EXISTS sessions")
            conn.execute("DROP TABLE IF EXISTS session_questions")
            conn.execute("DROP TABLE IF EXISTS session_answers")
            conn.commit()
    except Exception as e:
        logger.debug(f"Schema migration check bypassed: {e}")

    # 0. Users table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            password_hash TEXT NOT NULL,
            created_at TEXT
        )
    """)

    # 1. Main sessions table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            candidate_name TEXT NOT NULL DEFAULT 'Candidate',
            role TEXT NOT NULL DEFAULT 'software_engineer',
            interview_format TEXT NOT NULL DEFAULT 'voice',
            difficulty TEXT NOT NULL DEFAULT 'medium',
            panel_mode INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'active',
            started_at TEXT,
            completed_at TEXT,
            resume_data TEXT NOT NULL DEFAULT '{}',
            results TEXT
        )
    """)

    # 2. Normalized questions table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS session_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            question_id INTEGER NOT NULL,
            text TEXT NOT NULL,
            category TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            type TEXT NOT NULL,
            persona_id TEXT,
            FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
        )
    """)

    # 3. Normalized answers table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS session_answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            question_index INTEGER NOT NULL,
            question_text TEXT NOT NULL,
            answer_text TEXT NOT NULL,
            voice_metrics TEXT NOT NULL DEFAULT '{}',
            emotion_metrics TEXT NOT NULL DEFAULT '{}',
            evaluation TEXT NOT NULL DEFAULT '{}',
            timestamp TEXT,
            FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
        )
    """)
    conn.commit()
    logger.info("SQLite database initialized with normalized tables")


def _row_to_session(row: sqlite3.Row) -> dict:
    """Convert a database row to a session dict, loading relational tables."""
    d = dict(row)
    session_id = d["id"]
    conn = _get_conn()
    
    # 1. Load questions
    q_rows = conn.execute(
        """SELECT question_id, text, category, difficulty, type, persona_id 
           FROM session_questions WHERE session_id = ? ORDER BY id""",
        (session_id,)
    ).fetchall()
    
    d["questions"] = []
    for r in q_rows:
        d["questions"].append({
            "id": r["question_id"],
            "text": r["text"],
            "category": r["category"],
            "difficulty": r["difficulty"],
            "type": r["type"],
            "persona_id": r["persona_id"]
        })
        
    # 2. Load answers
    a_rows = conn.execute(
        """SELECT question_index, question_text, answer_text, voice_metrics, emotion_metrics, evaluation, timestamp 
           FROM session_answers WHERE session_id = ? ORDER BY id""",
        (session_id,)
    ).fetchall()
    
    d["answers"] = []
    for r in a_rows:
        idx = r["question_index"]
        q_obj = {"text": r["question_text"]}
        if 0 <= idx < len(d["questions"]):
            q_obj = d["questions"][idx]
            
        d["answers"].append({
            "question_index": idx,
            "question": q_obj,
            "answer": r["answer_text"],
            "voice_metrics": json.loads(r["voice_metrics"]),
            "emotion_metrics": json.loads(r["emotion_metrics"]),
            "evaluation": json.loads(r["evaluation"]),
            "timestamp": r["timestamp"]
        })
        
    d["resume_data"] = json.loads(d["resume_data"])
    d["results"] = json.loads(d["results"]) if d["results"] else None
    d["panel_mode"] = bool(d["panel_mode"])
    return d


def save_session(session: dict):
    """Insert or replace a session and sync associated questions and answers."""
    conn = _get_conn()
    try:
        # 1. Save main session metadata
        conn.execute(
            """INSERT OR REPLACE INTO sessions
               (id, candidate_name, role, interview_format, difficulty,
                panel_mode, status, started_at, completed_at,
                resume_data, results)
               VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
            (
                session["id"],
                session.get("candidate_name", "Candidate"),
                session.get("role", "software_engineer"),
                session.get("interview_format", "voice"),
                session.get("difficulty", "medium"),
                int(session.get("panel_mode", False)),
                session.get("status", "active"),
                session.get("started_at"),
                session.get("completed_at"),
                json.dumps(session.get("resume_data", {}), default=str),
                (
                    json.dumps(session.get("results"), default=str)
                    if session.get("results")
                    else None
                ),
            ),
        )
        
        # 2. Sync questions: delete and insert fresh
        conn.execute("DELETE FROM session_questions WHERE session_id = ?", (session["id"],))
        for q in session.get("questions", []):
            conn.execute(
                """INSERT INTO session_questions
                   (session_id, question_id, text, category, difficulty, type, persona_id)
                   VALUES (?,?,?,?,?,?,?)""",
                (
                    session["id"],
                    q.get("id", 0),
                    q.get("text", ""),
                    q.get("category", "General"),
                    q.get("difficulty", "medium"),
                    q.get("type", "technical"),
                    q.get("persona_id")
                )
            )
            
        # 3. Sync answers: delete and insert fresh
        conn.execute("DELETE FROM session_answers WHERE session_id = ?", (session["id"],))
        for a in session.get("answers", []):
            q_obj = a.get("question", {})
            q_text = q_obj.get("text", "") if isinstance(q_obj, dict) else str(q_obj)
            conn.execute(
                """INSERT INTO session_answers
                   (session_id, question_index, question_text, answer_text,
                    voice_metrics, emotion_metrics, evaluation, timestamp)
                   VALUES (?,?,?,?,?,?,?,?)""",
                (
                    session["id"],
                    a.get("question_index", 0),
                    q_text,
                    a.get("answer", ""),
                    json.dumps(a.get("voice_metrics", {}), default=str),
                    json.dumps(a.get("emotion_metrics", {}), default=str),
                    json.dumps(a.get("evaluation", {}), default=str),
                    a.get("timestamp")
                )
            )
            
        conn.commit()
    except Exception as e:
        conn.rollback()
        logger.error(f"Failed to save session {session.get('id')}: {e}")
        raise e


def get_session(session_id: str) -> dict | None:
    """Retrieve a session by ID."""
    conn = _get_conn()
    row = conn.execute("SELECT * FROM sessions WHERE id = ?", (session_id,)).fetchone()
    return _row_to_session(row) if row else None


def get_all_sessions() -> list[dict]:
    """Return all sessions as dicts."""
    conn = _get_conn()
    rows = conn.execute("SELECT * FROM sessions ORDER BY started_at DESC").fetchall()
    return [_row_to_session(r) for r in rows]


def delete_session(session_id: str):
    """Delete a session by ID."""
    conn = _get_conn()
    conn.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
    conn.commit()


def delete_all():
    """Delete all sessions."""
    conn = _get_conn()
    conn.execute("DELETE FROM sessions")
    conn.commit()


def create_user(username: str, password_hash: str) -> bool:
    """Create a new user. Return True if successful, False if username exists."""
    conn = _get_conn()
    try:
        row = conn.execute("SELECT 1 FROM users WHERE username = ?", (username,)).fetchone()
        if row:
            return False
        
        from datetime import datetime
        conn.execute(
            "INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)",
            (username, password_hash, datetime.utcnow().isoformat())
        )
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        logger.error(f"Failed to create user {username}: {e}")
        return False


def get_user(username: str) -> dict | None:
    """Retrieve a user by username."""
    conn = _get_conn()
    row = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    if row:
        return dict(row)
    return None


# Auto-initialize on import
init_db()
