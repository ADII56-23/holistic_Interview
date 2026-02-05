@echo off
echo Starting Holistic Interview Intelligence...

echo Installing Backend Dependencies...
cd backend
python -m pip install -r requirements.txt

echo Starting Backend Server...
:: Opens a new command prompt window for the backend server
start "Backend Server" cmd /k "title Backend Server && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo Opening Frontend...
cd ..
:: Opens the frontend in the default web browser
start "" "frontend\index.html"

echo Application started!
echo Backend is running at http://localhost:8000
echo Frontend is opened in your browser.
pause
