"""
Database utility — SQLite storage for structured case data.
"""

import sqlite3
import json
import uuid
import re
from datetime import datetime
from typing import Optional, List

DB_PATH = "nyayaai.db"


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_conn()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS cases (
            id              TEXT PRIMARY KEY,
            filename        TEXT,
            case_title      TEXT,
            court           TEXT,
            year            TEXT,
            judge           TEXT,
            case_category   TEXT,
            case_number     TEXT,
            issue           TEXT,
            final_judgment  TEXT,
            structured_data TEXT,
            created_at      TEXT
        )
    """)
    conn.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS cases_fts USING fts5(
            id, case_title, issue, law_sections, court, year
        )
    """)
    conn.commit()
    conn.close()


def save_case(data: dict, filename: str) -> str:
    case_id = str(uuid.uuid4())
    conn = get_conn()
    conn.execute("""
        INSERT INTO cases VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        case_id,
        filename,
        data.get("case_title", ""),
        data.get("court", ""),
        str(data.get("year", "")),
        data.get("judge", ""),
        data.get("case_category", ""),
        data.get("case_number", ""),
        data.get("issue", ""),
        data.get("final_judgment", ""),
        json.dumps(data),
        datetime.utcnow().isoformat(),
    ))
    # Also insert into FTS
    conn.execute("""
        INSERT INTO cases_fts VALUES (?, ?, ?, ?, ?, ?)
    """, (
        case_id,
        data.get("case_title", ""),
        data.get("issue", ""),
        " ".join(data.get("law_sections", [])),
        data.get("court", ""),
        str(data.get("year", "")),
    ))
    conn.commit()
    conn.close()
    return case_id


def get_all_cases() -> List[dict]:
    conn = get_conn()
    rows = conn.execute("""
        SELECT id, filename, case_title, court, year, judge, 
               case_category, issue, final_judgment, structured_data, created_at
        FROM cases ORDER BY created_at DESC
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_case_by_id(case_id: str) -> Optional[dict]:
    conn = get_conn()
    row = conn.execute("SELECT * FROM cases WHERE id = ?", (case_id,)).fetchone()
    conn.close()
    if not row:
        return None
    result = dict(row)
    if result.get("structured_data"):
        result["structured_data"] = json.loads(result["structured_data"])
    return result


def search_cases(query: str, filters: Optional[dict] = None) -> List[dict]:
    conn = get_conn()
    query = (query or "").strip()
    filters = filters or {}

    if query:
        # FTS search first
        try:
            rows = conn.execute("""
                SELECT c.id, c.case_title, c.court, c.year, c.issue, c.final_judgment, c.structured_data
                FROM cases c
                JOIN cases_fts fts ON c.id = fts.id
                WHERE cases_fts MATCH ?
                LIMIT 50
            """, (query,)).fetchall()
        except Exception:
            # Fallback to LIKE search
            rows = conn.execute("""
                SELECT id, case_title, court, year, issue, final_judgment, structured_data
                FROM cases
                WHERE case_title LIKE ? OR issue LIKE ? OR final_judgment LIKE ?
                LIMIT 50
            """, (f"%{query}%", f"%{query}%", f"%{query}%")).fetchall()
    else:
        rows = conn.execute("""
            SELECT id, case_title, court, year, issue, final_judgment, structured_data
            FROM cases
            ORDER BY created_at DESC
            LIMIT 50
        """).fetchall()

    conn.close()

    def _matches(item: dict) -> bool:
        def _norm(s: str) -> str:
            return re.sub(r"[^a-z0-9]+", "", (s or "").lower())

        try:
            payload = json.loads(item.get("structured_data") or "{}")
        except json.JSONDecodeError:
            payload = {}

        verdict_type = (filters.get("verdict_type") or "").lower().strip()
        law_section = (filters.get("law_section") or "").lower().strip()
        court = (filters.get("court") or "").lower().strip()
        year = str(filters.get("year") or "").strip()
        category = (filters.get("case_category") or "").lower().strip()

        if verdict_type and verdict_type not in (item.get("final_judgment") or "").lower():
            return False
        if law_section:
            sections = payload.get("law_sections", [])
            law_norm = _norm(law_section)
            if not any(
                law_norm in _norm(str(section)) or _norm(str(section)) in law_norm
                for section in sections
            ):
                return False
        if court and court not in (item.get("court") or "").lower():
            return False
        if year and year != str(item.get("year") or ""):
            return False
        if category and category not in str(payload.get("case_category", "")).lower():
            return False
        return True

    results: List[dict] = []
    for row in rows:
        item = dict(row)
        if _matches(item):
            item.pop("structured_data", None)
            results.append(item)
        if len(results) >= 20:
            break

    return results
