# ⚖️ NyayaAI — Agentic AI for Indian Case Law Intelligence

> **Hackathon Prototype** | Multi-Agent AI System for Structured Indian Legal Intelligence

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER / RESEARCHER                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │  Upload PDF / Natural Language Query
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND (Vite)                         │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Upload  │  │ Pipeline  │  │ Results  │  │  Analytics   │  │
│  │  Screen  │  │  Viewer   │  │  Viewer  │  │  Dashboard   │  │
│  └──────────┘  └───────────┘  └──────────┘  └──────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │  REST API + WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FASTAPI BACKEND (Python)                       │
│  POST /upload  GET /status/{id}  POST /search  POST /query      │
│  GET /cases    GET /analytics    GET /cases/{id}                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          ▼                                 ▼
┌─────────────────────┐         ┌──────────────────────────────┐
│   MASTER AGENT      │         │         VECTOR STORE          │
│   Orchestrator      │         │   FAISS (semantic search)     │
│                     │         │   + sentence-transformers     │
│  ┌──────────────┐   │         └──────────────────────────────┘
│  │ Document     │   │
│  │ Ingestion    │   │         ┌──────────────────────────────┐
│  ├──────────────┤   │         │        SQLite DATABASE        │
│  │ Issue ID     │   │         │  cases table + FTS5 index     │
│  ├──────────────┤   │         └──────────────────────────────┘
│  │ Petitioner   │   │
│  ├──────────────┤   │
│  │ Respondent   │   │              LLM (OpenAI / Groq)
│  ├──────────────┤   │◄────────────────────────────────────
│  │ Law Sections │   │         gpt-4o-mini / llama-3-70b
│  ├──────────────┤   │
│  │ Precedents   │   │
│  ├──────────────┤   │
│  │ Reasoning    │   │
│  ├──────────────┤   │
│  │ Judgment     │   │
│  ├──────────────┤   │
│  │ Metadata     │   │
│  └──────────────┘   │
└─────────────────────┘
```

---

## 🤖 Multi-Agent Pipeline

| # | Agent | Role | Output |
|---|-------|------|--------|
| 1 | **Document Ingestion** | PDF/TXT text extraction | Raw text |
| 2 | **Issue Identification** | Core legal question | String |
| 3 | **Petitioner Agent** | Petitioner's arguments | `string[]` |
| 4 | **Respondent Agent** | Respondent's arguments | `string[]` |
| 5 | **Law Section Agent** | Statutes & sections cited | `string[]` |
| 6 | **Precedent Analysis** | Past cases cited | `{case_name, citation, relevance}[]` |
| 7 | **Court Reasoning** | Judge's logic summarized | String |
| 8 | **Final Judgment** | Verdict extracted | String |
| 9 | **Metadata Agent** | Title, court, year, judge | Object |
| 10 | **Master Agent** | Merges all → JSON | Structured JSON |

---

## 📁 Folder Structure

```
nyayaai/
├── backend/
│   ├── main.py                  # FastAPI app, routes
│   ├── requirements.txt         # Dependencies
│   ├── demo_dataset.json        # 3 demo cases
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── base_agent.py        # LLM base class
│   │   ├── master_agent.py      # Orchestrator
│   │   ├── document_agent.py    # All specialized agents
│   │   ├── issue_agent.py       # (re-export)
│   │   ├── petitioner_agent.py  # (re-export)
│   │   ├── respondent_agent.py  # (re-export)
│   │   ├── law_section_agent.py # (re-export)
│   │   ├── precedent_agent.py   # (re-export)
│   │   ├── reasoning_agent.py   # (re-export)
│   │   ├── judgment_agent.py    # (re-export)
│   │   └── metadata_agent.py   # (re-export)
│   └── utils/
│       ├── database.py          # SQLite + FTS5
│       └── vector_store.py      # FAISS semantic search
└── frontend/
    └── src/
        └── App.jsx              # Complete React app (all screens)
```

---

## 🚀 Running the Prototype

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set API key
export OPENAI_API_KEY="sk-your-key-here"
# Or use Groq (free):
export OPENAI_API_KEY="gsk_your_groq_key"
export LLM_MODEL="llama-3.1-70b-versatile"
# Update base_url in base_agent.py for Groq:
# client = AsyncOpenAI(api_key=..., base_url="https://api.groq.com/openai/v1")

# Run server
uvicorn main:app --reload --port 8000
```

### 2. Load Demo Data (without API key)

```bash
# Seed the database with demo cases
python -c "
import sqlite3, json
from utils.database import init_db, save_case
init_db()
with open('demo_dataset.json') as f:
    cases = json.load(f)
for c in cases:
    save_case(c, c['filename'])
print('Demo data loaded!')
"
```

### 3. Frontend Setup

```bash
cd frontend

# Install
npm create vite@latest . --template react
npm install

# Replace src/App.jsx with our App.jsx
# Add to index.html: <link rel="stylesheet" href="...tailwind...">

npm run dev
# → http://localhost:5173
```

### 4. Quick Demo (no setup needed)

Open the React component directly in Claude.ai Artifacts — it includes
all 3 demo cases and the full UI with no backend required.

---

## 📊 Output JSON Format

```json
{
  "case_title": "Kesavananda Bharati v. State of Kerala",
  "court": "Supreme Court of India",
  "year": "1973",
  "judge": "CJ S.M. Sikri (13-judge bench)",
  "case_category": "Constitutional",
  "case_number": "Writ Petition (Civil) 135/1970",
  "issue": "Whether Parliament has unlimited power to amend...",
  "petitioner_arguments": ["arg1", "arg2", "..."],
  "respondent_arguments": ["arg1", "arg2", "..."],
  "law_sections": ["Article 368 Constitution of India", "..."],
  "precedents": [
    {
      "case_name": "I.C. Golak Nath v. State of Punjab",
      "citation": "AIR 1967 SC 1643",
      "relevance": "Parliament cannot amend fundamental rights"
    }
  ],
  "court_reasoning": "The Supreme Court by 7-6 majority...",
  "final_judgment": "Basic Structure Doctrine established...",
  "summary": "One-paragraph overview..."
}
```

---

## 🔍 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/upload` | Upload PDF/TXT judgment |
| `GET` | `/status/{job_id}` | Poll processing status |
| `GET` | `/cases` | List all processed cases |
| `GET` | `/cases/{id}` | Get full case detail |
| `POST` | `/search` | Structured search with filters |
| `POST` | `/query` | Natural language query |
| `GET` | `/analytics` | Dashboard metrics |

---

## 🔮 Future Improvements

1. **Multi-language support** — Tamil, Hindi, Marathi judgments via multilingual LLMs
2. **Citation Graph** — Visualize how cases cite each other (Neo4j graph database)
3. **Contradiction Detection** — Flag when two precedents contradict each other
4. **Judicial Trend Analysis** — Track how specific judges rule over time
5. **Legal Research Assistant** — Chat with cases using RAG
6. **Court-specific fine-tuned models** — Fine-tune on Indian legal corpus (InLegalBERT)
7. **Batch processing** — Process 100s of judgments from Supreme Court website
8. **API webhooks** — Real-time notifications when new judgments are processed
9. **Export** — PDF/Word reports with structured case summaries
10. **Mobile app** — React Native app for lawyers on the go

---

## 🏆 Hackathon Highlights

- ✅ **10 specialized AI agents** — each with expert-crafted prompts
- ✅ **Real PDF parsing** — PyMuPDF + pypdf fallback
- ✅ **Semantic search** — FAISS + sentence-transformers
- ✅ **Full-text search** — SQLite FTS5 index
- ✅ **Natural language queries** — "Show acquittal cases under IPC 420"
- ✅ **Analytics dashboard** — Frequently cited sections, verdict patterns
- ✅ **Production-ready FastAPI** — Async, background tasks, CORS
- ✅ **Beautiful React UI** — 4 screens, agent pipeline visualization

---

*Built for Deloitte Hackathon · NyayaAI Team*
