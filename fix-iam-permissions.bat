@echo off
REM Fix IAM Permissions for Lambda and Athena
REM This script ensures all required permissions are properly configured

echo === Fixing IAM Permissions for Lambda and Athena ===
echo.

REM Run PowerShell script
powershell -ExecutionPolicy Bypass -File "%~dp0fix-iam-permissions.ps1"

echo.
pause

