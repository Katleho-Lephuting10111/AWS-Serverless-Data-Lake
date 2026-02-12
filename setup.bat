@echo off
REM AWS Serverless Data Lake - Terraform Setup Script
REM Run this script to deploy the infrastructure

echo ============================================
echo AWS Serverless Data Lake - Terraform Setup
echo ============================================

REM Check if Terraform is installed
where terraform >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Terraform not found!
    echo.
    echo Please install Terraform first:
    echo 1. Download from: https://www.terraform.io/downloads
    echo 2. Extract to a folder
    echo 3. Add the folder to your PATH
    echo.
    echo OR install via Chocolatey:
    echo    choco install terraform -y
    pause
    exit /b 1
)

echo [OK] Terraform found: 
terraform -v

REM Check AWS CLI
where aws >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] AWS CLI not found!
    echo Please install AWS CLI from: https://aws.amazon.com/cli/
    pause
    exit /b 1
)

echo [OK] AWS CLI found

REM Verify AWS credentials
echo.
echo Verifying AWS credentials...
aws sts get-caller-identity >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] AWS credentials not configured!
    echo.
    echo Run: aws configure
    echo OR: aws sso login
    pause
    exit /b 1
)

echo [OK] AWS credentials configured

REM Get current directory
set "PROJECT_DIR=%~dp0"
set "TERRAFORM_DIR=%PROJECT_DIR%student-datalake"

echo.
echo Project directory: %PROJECT_DIR%
echo Terraform directory: %TERRAFORM_DIR%

REM Change to Terraform directory
cd /d "%TERRAFORM_DIR%"

echo.
echo ============================================
echo Step 1: Initialize Terraform
echo ============================================
echo.

REM Initialize Terraform
call terraform init

if %errorlevel% neq 0 (
    echo [ERROR] Terraform init failed!
    pause
    exit /b 1
)

echo.
echo ============================================
echo Step 2: Review Plan
echo ============================================
echo.

call terraform plan

if %errorlevel% neq 0 (
    echo [ERROR] Terraform plan failed!
    pause
    exit /b 1
)

echo.
echo ============================================
echo Step 3: Apply Terraform
echo ============================================
echo.
echo WARNING: This will create AWS resources that may incur costs.
echo Type 'yes' to continue or 'no' to cancel.
echo.

call terraform apply

if %errorlevel% neq 0 (
    echo [ERROR] Terraform apply failed!
    pause
    exit /b 1
)

echo.
echo ============================================
echo Deployment Complete!
echo ============================================
echo.

REM Get outputs
echo API Endpoint:
call terraform output api_endpoint
echo.
echo Lambda Function:
call terraform output lambda_function_name
echo.
echo S3 Bucket:
call terraform output bucket_name

echo.
echo Next steps:
echo 1. Update Lambda: rebuild-lambda.bat
echo 2. Test API: test-api.bat
echo 3. Configure frontend with the API endpoint above

pause

