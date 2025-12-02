@echo off
echo Setting up NeuroLens Backend Environment with Python 3.10...

py -3.10 --version
if %errorlevel% neq 0 (
    echo Python 3.10 not found.
    pause
    exit /b 1
)

echo Creating virtual environment...
py -3.10 -m venv neurolens_env

echo Activating environment...
call neurolens_env\Scripts\activate.bat

echo Upgrading pip...
python -m pip install --upgrade pip

echo Installing dependencies...
pip install -r backend\requirements.txt

echo.
echo Setup complete!
echo.
pause
