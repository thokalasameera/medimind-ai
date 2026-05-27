@echo off
title MediMind AI Launcher
echo ===================================================
echo   MediMind AI - Futuristic Health Console Starter
echo ===================================================
echo.

echo ⚡ [1/4] Installing Python AI/ML dependencies...
cd ml_service
call pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: Python library installation failed.
    echo Please verify Python is added to your environment variables (PATH).
    pause
    exit /b %errorlevel%
)

echo.
echo ⚡ [2/4] Training AI/ML Models Locally (Random Forests + Chatbot)...
call python train_models.py
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: AI/ML model training failed.
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo ⚡ [3/4] Installing Express REST API Dependencies...
cd backend
call npm install
cd ..

echo.
echo ⚡ [4/4] Installing React Web Application Dependencies...
cd frontend
call npm install
cd ..

echo.
echo ===================================================
echo   🎉 BOOTING DYNAMIC MULTI-TIER SERVICES...
echo ===================================================
echo.
echo 🚀 Flask ML Service starting on http://localhost:5005
echo 🚀 Express REST Backend starting on http://localhost:5000
echo 🚀 React Frontend starting on http://localhost:5173
echo.
echo (Three separate terminal windows will launch. Keep them open!)
echo.

:: Launch Flask ML Service on Port 5005
start "MediMind [Flask ML Service - 5005]" cmd /k "cd ml_service && python app.py"

:: Launch Node.js Backend on Port 5000
start "MediMind [Express REST API - 5000]" cmd /k "cd backend && npm run start"

:: Launch React Frontend
start "MediMind [Vite React Client]" cmd /k "cd frontend && npm run dev"

echo.
echo Done! The app is booting up. Open http://localhost:5173 in your browser.
echo Press any key to exit this launcher window...
pause > nul
