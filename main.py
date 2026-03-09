"""
NyayaAI - Agentic AI for Indian Case Law Intelligence
Main FastAPI Application
"""

import uuid
import json
from datetime import datetime
from typing import Optional
from dotenv import load_dotenv

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agents.master_agent import MasterAgent
from utils.database import init_db, save_case, get_all_cases, get_case_by_id, search_cases
from utils.vector_store import VectorStore

load_dotenv()

# ──────────────────────────────────────────────
# App Setup
# ──────────────────────────────────────────────

app = FastAPI(
    title="NyayaAI – Indian Legal Intelligence Platform",
    description="Multi-Agent AI system for structured Indian case law analysis",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    # "*" with credentials=True is rejected by browsers.
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state for job tracking
processing_jobs: dict = {}

vector_store = VectorStore()


# ──────────────────────────────────────────────
# Models
# ──────────────────────────────────────────────

class SearchQuery(BaseModel):
    query: str
    filters: Optional[dict] = None

class NLQuery(BaseModel):
    question: str


# ──────────────────────────────────────────────
# Startup
# ──────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    init_db()
    print("[startup] NyayaAI backend started. DB initialized.")


# ──────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────

@app.get("/")
async def root():
    return {"message": "NyayaAI API is live", "version": "1.0.0"}


@app.post("/upload")
async def upload_judgment(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """
    Upload a legal judgment PDF or TXT file.
    Returns a job_id to track processing.
    """
    if not file.filename or not file.filename.endswith((".pdf", ".txt")):
        raise HTTPException(status_code=400, detail="Only PDF and TXT files supported.")

    job_id = str(uuid.uuid4())
    content = await file.read()

    processing_jobs[job_id] = {
        "status": "queued",
        "filename": file.filename,
        "started_at": datetime.utcnow().isoformat(),
        "agents_completed": [],
        "result": None,
    }

    background_tasks.add_task(process_judgment, job_id, content, file.filename)

    return {"job_id": job_id, "message": "Processing started", "filename": file.filename}


@app.get("/status/{job_id}")
async def get_status(job_id: str):
    """Poll processing status and agent progress."""
    if job_id not in processing_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return processing_jobs[job_id]


@app.get("/cases")
async def list_cases():
    """Get all processed cases."""
    cases = get_all_cases()
    return {"cases": cases, "total": len(cases)}


@app.get("/cases/{case_id}")
async def get_case(case_id: str):
    """Get a specific case by ID."""
    case = get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@app.post("/search")
async def search(query: SearchQuery):
    """Search cases with structured filters or keyword query."""
    results = search_cases(query.query, query.filters)
    # Also do vector similarity search
    vector_results = vector_store.search(query.query, top_k=5)
    return {
        "results": results,
        "semantic_results": vector_results,
        "total": len(results),
    }


@app.post("/query")
async def natural_language_query(nl_query: NLQuery):
    """
    Accept a natural language question and return relevant cases.
    Example: 'Show acquittal cases under IPC 420'
    """
    # Parse intent from question using simple rules (extend with LLM)
    question = nl_query.question.lower()
    filters = {}

    if "acquittal" in question or "acquitted" in question:
        filters["verdict_type"] = "acquittal"
    if "conviction" in question or "convicted" in question:
        filters["verdict_type"] = "conviction"

    # Extract IPC sections mentioned
    import re
    ipc_sections = re.findall(r"ipc\s*(\d+[a-z]*)", question)
    if ipc_sections:
        filters["law_section"] = ipc_sections[0].upper()

    # For intent-driven NL queries, avoid forcing strict keyword search
    # on the full sentence when we already have structured filters.
    db_query = "" if filters else nl_query.question
    results = search_cases(db_query, filters)
    vector_results = vector_store.search(nl_query.question, top_k=5)

    return {
        "question": nl_query.question,
        "interpreted_filters": filters,
        "results": results,
        "semantic_results": vector_results,
    }


@app.get("/analytics")
async def analytics():
    """Dashboard analytics: frequent sections, verdict patterns."""
    cases = get_all_cases()
    if not cases:
        return {"law_sections": [], "verdict_patterns": [], "courts": [], "years": []}

    from collections import Counter

    all_sections = []
    all_verdicts = []
    all_courts = []
    all_years = []

    for c in cases:
        data = json.loads(c["structured_data"]) if isinstance(c["structured_data"], str) else c["structured_data"]
        all_sections.extend(data.get("law_sections", []))
        all_verdicts.append(data.get("final_judgment", "Unknown")[:30])
        all_courts.append(data.get("court", "Unknown"))
        all_years.append(str(data.get("year", "Unknown")))

    return {
        "law_sections": [{"section": k, "count": v} for k, v in Counter(all_sections).most_common(10)],
        "verdict_patterns": [{"verdict": k, "count": v} for k, v in Counter(all_verdicts).most_common(10)],
        "courts": [{"court": k, "count": v} for k, v in Counter(all_courts).most_common(10)],
        "years": [{"year": k, "count": v} for k, v in Counter(all_years).most_common(10)],
        "total_cases": len(cases),
    }


# ──────────────────────────────────────────────
# Background Processing
# ──────────────────────────────────────────────

async def process_judgment(job_id: str, content: bytes, filename: str):
    """Run the multi-agent pipeline on the uploaded document."""
    try:
        processing_jobs[job_id]["status"] = "processing"

        agent = MasterAgent(
            job_id=job_id,
            progress_callback=lambda agent_name: update_progress(job_id, agent_name)
        )

        result = await agent.run(content, filename)

        # Save to DB
        case_id = save_case(result, filename)
        result["case_id"] = case_id

        # Index in vector store
        summary_text = f"{result.get('case_title','')} {result.get('issue','')} {result.get('summary','')}"
        vector_store.add(case_id, summary_text, result)

        processing_jobs[job_id]["status"] = "completed"
        processing_jobs[job_id]["result"] = result
        processing_jobs[job_id]["case_id"] = case_id

    except Exception as e:
        processing_jobs[job_id]["status"] = "failed"
        processing_jobs[job_id]["error"] = str(e)
        raise


def update_progress(job_id: str, agent_name: str):
    if job_id in processing_jobs:
        processing_jobs[job_id]["agents_completed"].append(agent_name)
        processing_jobs[job_id]["current_agent"] = agent_name
