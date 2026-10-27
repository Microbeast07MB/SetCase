@echo off
title SetuCase - AICTE Platform Launcher
set "PATH=%~dp0node-runtime\node-v20.18.0-win-x64;%PATH%"

echo ===================================================================
echo   Starting SetuCase - AICTE Complaint & Bureau Platform
echo ===================================================================

echo [1/2] Starting Node.js Express Backend on port 5000...
start "SetuCase Backend" cmd /k "cd backend && node src/server.js"

echo [2/2] Starting React Vite Frontend on port 3000...
start "SetuCase Frontend" cmd /k "cd frontend && npx vite --port 3000"

echo.
echo SetuCase is booting up!
echo Frontend will be reachable at: http://localhost:3000
echo Backend API will be reachable at: http://localhost:5000
echo ===================================================================
timeout /t 5 >nul
start http://localhost:3000

