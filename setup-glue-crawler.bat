@echo off
REM Glue Crawler Setup and Management Script
REM This script manages the Glue crawler to populate the database with tables

echo === Glue Crawler Setup ===
echo.

REM Run PowerShell script
powershell -ExecutionPolicy Bypass -File "%~dp0setup-glue-crawler.ps1"

echo.

