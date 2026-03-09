# NyayaAI

NyayaAI is a full-stack legal intelligence project that converts long Indian court judgments (PDF/TXT) into structured case output.

It includes:
- FastAPI backend with a multi-step extraction pipeline
- React (Vite) frontend for upload, review, search, and analytics
- SQLite storage with full-text search
- Natural-language case querying
- Evidence and confidence mapping against source text

## What it does

For each uploaded judgment, NyayaAI extracts:
- Core legal issue
- Petitioner arguments
- Respondent arguments
- Law sections applied
- Precedents cited
- Court reasoning
- Final judgment
- Metadata (title, court, year, judge, category, case number)
- Source validation (coverage + evidence snippets)

## Tech Stack

- Backend: Python, FastAPI, Uvicorn
- Frontend: React 18, Vite
- Database: SQLite + FTS5
- LLM access: OpenAI-compatible client (works with Groq key)

## Project Structure

```text
NyayaAI/
  agents/                # extraction agents + orchestrator
  utils/                 # database + vector store helper
  frontend/              # React app
    src/
  main.py                # FastAPI entrypoint
  requirements.txt
  .env.example
  demo_dataset.json
  RUNNING.md
```

## Prerequisites

- Python 3.11+ (3.13 also works with current requirements constraints)
- Node.js 18+
- npm

## 1) Backend Setup

From project root:

```powershell
cd NyayaAI

python -m venv .venv
.\.venv\Scripts\Activate.ps1

pip install --upgrade pip
pip install -r requirements.txt
```

Create local env file:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and set at least:

```env
OPENAI_API_KEY=your_key_here
LLM_MODEL=llama-3.1-8b-instant
```

Notes:
- If you use a Groq key (`gsk_...`), backend auto-routes to Groq base URL.
- Never commit `.env`.

Run backend:

```powershell
uvicorn main:app --reload --port 8000
```

Backend URL: `http://127.0.0.1:8000`

## 2) Frontend Setup

Open a second terminal:

```powershell
cd frontend
npm install
cmd /c npm run dev
```

Frontend URL: `http://localhost:5173`

Why `cmd /c npm run dev`?
- On some Windows setups, PowerShell execution policy blocks `npm.ps1`.

## 3) How to Use

1. Open the frontend.
2. Go to Upload and submit a `.pdf` or `.txt` judgment.
3. Wait for processing to complete.
4. Review results in tabs:
   - Structured
   - Evidence (coverage + source snippets)
   - Full Data
   - Timeline
5. Use Cases page for:
   - keyword search
   - plain-language queries (for example: `show cases under IPC 420`)
6. Use Analytics page for section/category/court trends.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | health/info |
| POST | `/upload` | upload PDF/TXT judgment |
| GET | `/status/{job_id}` | track processing |
| GET | `/cases` | list saved cases |
| GET | `/cases/{case_id}` | get one case |
| POST | `/search` | keyword + filter search |
| POST | `/query` | plain-language query |
| GET | `/analytics` | dashboard aggregates |

## Output Shape (simplified)

```json
{
  "case_title": "...",
  "court": "...",
  "year": "...",
  "judge": "...",
  "case_category": "...",
  "case_number": "...",
  "issue": "...",
  "petitioner_arguments": [],
  "respondent_arguments": [],
  "law_sections": [],
  "precedents": [],
  "court_reasoning": "...",
  "final_judgment": "...",
  "summary": "...",
  "source_validation": {
    "overall_coverage_percent": 0,
    "field_coverage": {},
    "evidence": {}
  }
}
```

## Troubleshooting

### `pip install -r requirements.txt` fails on PyMuPDF/FAISS
Current `requirements.txt` already skips problematic native deps on Python 3.13 where needed.

### Backend shows LLM auth error
- Confirm `.env` exists in project root.
- Confirm `OPENAI_API_KEY` is set correctly.
- Restart backend after changing `.env`.

### Frontend opens but shows blank page
- Restart frontend dev server.
- Hard refresh browser: `Ctrl + Shift + R`.

### Natural-language query returns no cases
- Ensure uploaded case has `law_sections` populated.
- Try direct terms like `IPC 420`, `acquittal`, `conviction`.

## Security Notes

- `.env` is ignored by `.gitignore`.
- Do not paste API keys in code, README, or commits.
- Rotate key immediately if exposed.


