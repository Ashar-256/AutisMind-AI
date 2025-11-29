@echo off
echo Setting up NeuroLens Backend Environment...

REM Check if Python 3.11 is available
py -3.11 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python 3.11 not found. Please install Python 3.11 from python.org
    echo Direct link: https://www.python.org/downloads/release/python-3118/
    pause
    exit /b 1
)

echo Python 3.11 found!

REM Create virtual environment
echo Creating virtual environment...
py -3.11 -m venv neurolens_env

REM Activate environment
echo Activating environment...
call neurolens_env\Scripts\activate.bat

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install dependencies
echo Installing dependencies...
pip install -r backend\requirements.txt

echo.
echo Setup complete! 
echo.
echo To start the backend server:
echo 1. Run: neurolens_env\Scripts\activate.bat
echo 2. Run: cd backend
echo 3. Run: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
echo.
pause