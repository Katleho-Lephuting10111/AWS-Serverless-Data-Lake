@echo off
REM Upload Sample Data to S3 and Run Glue Crawler
powershell -ExecutionPolicy Bypass -File upload-data.ps1
pause
