@echo off
echo Starting NeuroLens Backend on localhost...
cd backend
echo Backend server starting at http://localhost:8000
echo WebSocket endpoints: ws://localhost:8000/ws/analyze and ws://localhost:8000/ws/audio
echo Press Ctrl+C to stop the server
uvicorn main_simple:app --host 127.0.0.1 --port 8000 --reload