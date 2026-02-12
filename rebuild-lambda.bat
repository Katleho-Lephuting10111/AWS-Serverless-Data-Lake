@echo off
REM Rebuild Lambda deployment package and update AWS Lambda function
REM This script creates a new zip file with the latest index.py and updates Lambda

echo === Lambda Deployment Package Rebuild ===
echo.

REM Get script directory
set SCRIPT_DIR=%~dp0
set LAMBDA_DIR=%SCRIPT_DIR%student-datalake

echo [1/4] Creating new Lambda zip package...
set ZIP_PATH=%LAMBDA_DIR%\lambda.zip
set INDEX_PATH=%LAMBDA_DIR%\index.py

if not exist "%INDEX_PATH%" (
    echo ERROR: index.py not found at %INDEX_PATH%
    pause
    exit /b 1
)

REM Remove old zip if exists
if exist "%ZIP_PATH%" (
    del "%ZIP_PATH%" /Q
    echo - Removed old lambda.zip
)

REM Create new zip using PowerShell
powershell -Command "
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open('%ZIP_PATH%', [System.IO.Compression.ZipArchiveMode]::Create)
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, '%INDEX_PATH%', 'index.py')
$zip.Dispose()
Write-Host '  - Created lambda.zip'
"

echo.
echo [2/4] Refreshing Terraform state (if needed)...
cd /d "%LAMBDA_DIR%"
if exist "terraform.exe" (
    terraform refresh >nul 2>&1
    echo - Terraform state refreshed
) else (
    echo - Terraform not in PATH, skipping state refresh
)

echo.
echo [3/4] Updating Lambda function in AWS...
for /f "delims=" %%i in ('powershell -Command "[Convert]::ToBase64String([System.IO.File]::ReadAllBytes('%ZIP_PATH%'))"') do set ZIP_BASE64=%%i

aws lambda update-function-code ^
    --function-name athena-query-student ^
    --zip-file "fileb://%ZIP_BASE64%" ^
    --output json

if %ERRORLEVEL% EQU 0 (
    echo - Lambda update initiated successfully
) else (
    echo ERROR: Lambda update failed
    pause
    exit /b 1
)

echo.
echo [4/4] Waiting for Lambda to be active...
powershell -Command "
$maxAttempts = 30
$attempt = 0
do {
    Start-Sleep -Seconds 2
    $attempt++
    $status = (aws lambda get-function --function-name athena-query-student --query 'Configuration.State' --output text 2>$null)
    if ($status -eq 'Active') {
        Write-Host '  - Lambda is now Active!' -ForegroundColor Green
        break
    }
    Write-Host '  - Attempt ' $attempt '/' $maxAttempts ': State=' $status
} while ($attempt -lt $maxAttempts)
"

echo.
echo === Lambda Update Complete ===
echo.
echo Next steps:
echo   1. Test the API: test-api.bat
echo   2. Or test directly in browser: https://shhoo6hhtl.execute-api.eu-west-1.amazonaws.com/dev/query
pause

