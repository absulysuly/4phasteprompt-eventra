@echo off
echo 💾 Saving session state for next time...
powershell -ExecutionPolicy Bypass -File "%~dp0capture-session.ps1"
pause