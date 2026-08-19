#!/usr/bin/env bash
echo "============================================================"
echo "  TalentForge AI v4.1 - Universal 1-Click Master Launcher (Linux/Mac)"
echo "============================================================"
echo ""

# 1. Verify Prerequisites
if ! command -v python3 &> /dev/null; then
    echo "[FAIL] Python 3 is not installed. Please install Python 3.9+"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "[FAIL] Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

echo "[OK] Prerequisites verified."

# 2. Virtual Environment
if [ ! -f ".venv/bin/python" ]; then
    echo "[!] Creating Python virtual environment..."
    python3 -m venv .venv
    .venv/bin/pip install --upgrade pip -q
    .venv/bin/pip install -r backend/requirements.txt -q
    echo "[OK] Python environment ready."
fi

# 3. spaCy Model
if ! .venv/bin/python -c "import spacy; spacy.load('en_core_web_sm')" &> /dev/null; then
    echo "[!] Downloading spaCy en_core_web_sm NLP model..."
    .venv/bin/python -m spacy download en_core_web_sm -q
    echo "[OK] spaCy NLP model ready."
fi

# 4. Node Modules
if [ ! -d "frontend/node_modules" ]; then
    echo "[!] Installing frontend dependencies..."
    (cd frontend && npm install)
    echo "[OK] Frontend dependencies ready."
fi

# 5. Database Directories
mkdir -p data uploads
.venv/bin/python scripts/populate_real_interview_data.py &> /dev/null

# 6. Launch Servers
echo ""
echo "🚀 Launching Backend API on http://localhost:5000..."
.venv/bin/python backend/app.py &
BACKEND_PID=$!

sleep 3

echo "🚀 Launching Frontend React App on http://localhost:5173..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

sleep 3

echo ""
echo "============================================================"
echo "  SUCCESS! TalentForge AI is LIVE at http://localhost:5173/"
echo "============================================================"

# Try to open default browser
if command -v open &> /dev/null; then
    open http://localhost:5173/
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173/
fi

wait $BACKEND_PID $FRONTEND_PID
