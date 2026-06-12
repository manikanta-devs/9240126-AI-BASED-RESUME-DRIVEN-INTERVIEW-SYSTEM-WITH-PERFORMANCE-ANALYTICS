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
            questions TEXT NOT NULL DEFAULT '[]',
            answers TEXT NOT NULL DEFAULT '[]',
            resume_data TEXT NOT NULL DEFAULT '{}',
            results TEXT
        )
    """)
    conn.commit()
    logger.info("SQLite database initialized")


def _row_to_session(row: sqlite3.Row) -> dict:
    """Convert a database row to a session dict."""
    d = dict(row)
    d["questions"] = json.loads(d["questions"])
    d["answers"] = json.loads(d["answers"])
    d["resume_data"] = json.loads(d["resume_data"])
    d["results"] = json.loads(d["results"]) if d["results"] else None
    d["panel_mode"] = bool(d["panel_mode"])
    return d


def save_session(session: dict):
    """Insert or replace a full session dict."""
    conn = _get_conn()
    conn.execute(
        """INSERT OR REPLACE INTO sessions
           (id, candidate_name, role, interview_format, difficulty,
            panel_mode, status, started_at, completed_at,
            questions, answers, resume_data, results)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
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
            json.dumps(session.get("questions", []), default=str),
            json.dumps(session.get("answers", []), default=str),
            json.dumps(session.get("resume_data", {}), default=str),
            json.dumps(session.get("results"), default=str) if session.get("results") else None,
        ),
    )
    conn.commit()


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


# Auto-initialize on import
init_db()
