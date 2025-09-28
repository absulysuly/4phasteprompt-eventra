@echo off
REM Git Session Management - Quick Access Wrapper
REM Usage: gs [command] [message]

powershell -ExecutionPolicy Bypass -File "%~dp0git-session.ps1" %*