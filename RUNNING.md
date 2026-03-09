# NyayaAI Run Guide

## 1) Backend

```powershell
cd "d:\Salman Folders\NyayaAI"

python -m venv .venv
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt

# One-time setup: create local env file
Copy-Item .env.example .env
# Edit .env and set OPENAI_API_KEY to your key.
# Optional: set LLM_MODEL and OPENAI_BASE_URL.

uvicorn main:app --reload --port 8000
```

Backend URL: `http://127.0.0.1:8000`

## 2) Frontend

```powershell
cd "d:\Salman Folders\NyayaAI\frontend"
# Optional one-time setup if backend is not at default URL:
# Copy-Item .env.example .env
# Then edit frontend/.env and set VITE_API_BASE_URL.
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## 3) Optional Demo Data Seed

```powershell
cd "d:\Salman Folders\NyayaAI"
python -c "import json; from utils.database import init_db, save_case; init_db(); cases=json.load(open('demo_dataset.json', encoding='utf-8')); [save_case(c, c.get('filename','demo.json')) for c in cases]; print('demo_data_seeded')"
```
