@echo off

REM Start backend server in a new terminal window
start "Backend" cmd /k "python api_server.py"

REM Start frontend server in a new terminal window
start "Frontend" cmd /k "cd frontend && npm run dev"

REM Wait a few seconds to allow frontend to start (optional, can be adjusted)
timeout /t 5 /nobreak >nul

REM Open the frontend UI in the default browser
start http://localhost:3000 