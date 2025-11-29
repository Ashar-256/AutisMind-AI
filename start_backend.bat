@echo off
echo Starting NeuroLens Backend...

REM Check if virtual environment exists
if not exist "neurolens_env\Scripts\activate.bat" (
    echo Virtual environment not found. Please run setup_backend.bat first.
    pause
    exit /b 1
)

REM Activate environment
call neurolens_env\Scripts\activate.bat

REM Change to backend directory
cd backend

REM Start the server
echo Backend server starting at http://localhost:8000
echo Press Ctrl+C to stop the server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload