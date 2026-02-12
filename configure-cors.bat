@echo off
REM Configure CORS for API Gateway
REM This script adds OPTIONS method for preflight requests

echo === Configuring CORS for API Gateway ===
echo.

REM Run PowerShell script
powershell -ExecutionPolicy Bypass -File "%~dp0configure-cors.ps1"

echo.
pause

