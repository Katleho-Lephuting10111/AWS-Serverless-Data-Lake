# Rebuild Lambda deployment package and update AWS Lambda function
# This script creates a new zip file with the latest index.py and updates the Lambda function

$ErrorActionPreference = "Stop"

# Set working directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$lambdaDir = Join-Path $scriptDir "student-datalake"

Write-Host "=== Lambda Deployment Package Rebuild ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create new zip file with latest index.py
Write-Host "[1/4] Creating new Lambda zip package..." -ForegroundColor Yellow
$zipPath = Join-Path $lambdaDir "lambda.zip"
$indexPath = Join-Path $lambdaDir "index.py"

if (-not (Test-Path $indexPath)) {
    Write-Error "index.py not found at: $indexPath"
    exit 1
}

# Remove existing zip if present
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
    Write-Host "  - Removed old lambda.zip"
}

# Create new zip file using .NET compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $indexPath, "index.py")
$zip.Dispose()

$zipSize = (Get-Item $zipPath).Length
Write-Host "  - Created lambda.zip ($([math]::Round($zipSize / 1024, 2)) KB)"
Write-Host ""

# Step 2: Update Terraform state (regenerate archive)
Write-Host "[2/4] Refreshing Terraform state..." -ForegroundColor Yellow
Set-Location $lambdaDir
terraform refresh 2>&1 | Out-Host
Write-Host ""

# Step 3: Update Lambda function code
Write-Host "[3/4] Updating Lambda function in AWS..." -ForegroundColor Yellow
$zipBytes = [System.IO.File]::ReadAllBytes($zipPath)
$zipBase64 = [Convert]::ToBase64String($zipBytes)

$updateResult = aws lambda update-function-code `
    --function-name athena-query-student `
    --zip-file "fileb://$zipBase64" `
    --output json

if ($LASTEXITCODE -eq 0) {
    Write-Host "  - Lambda update initiated successfully" -ForegroundColor Green
    $updateResult | Write-Host
} else {
    Write-Error "Lambda update failed: $updateResult"
    exit 1
}
Write-Host ""

# Step 4: Wait for Lambda to be active
Write-Host "[4/4] Waiting for Lambda to be active..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0

do {
    $attempt++
    $status = aws lambda get-function --function-name athena-query-student --query 'Configuration.State' --output text 2>&1
    if ($status -eq "Active") {
        Write-Host "  - Lambda is now Active!" -ForegroundColor Green
        break
    }
    Write-Host "  - Attempt $attempt/$maxAttempts: State=$status"
    Start-Sleep -Seconds 2
} while ($attempt -lt $maxAttempts)

if ($attempt -ge $maxAttempts) {
    Write-Warning "Lambda state check timed out, but update was initiated"
}

Write-Host ""
Write-Host "=== Lambda Update Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Test the API: .\$((Split-Path -Leaf $MyInvocation.MyCommand.Path) -replace '\.ps1$', '.bat')" -ForegroundColor White
Write-Host "  2. Or run: .\$((Split-Path -Leaf $MyInvocation.MyCommand.Path) -replace '\.ps1$', '.bat')" -ForegroundColor White

