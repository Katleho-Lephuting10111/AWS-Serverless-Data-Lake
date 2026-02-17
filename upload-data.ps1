# Upload Sample Data to S3 and Run Glue Crawler
# This script uploads the sample student wellness data to your S3 bucket

$BUCKET_NAME = "student-socialmedia-datalake"
$REGION = "eu-west-1"
$CRAWLER_NAME = "student-crawler"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Upload Data to S3 Data Lake" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if AWS CLI is installed
$awsVersion = aws --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: AWS CLI is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install AWS CLI from: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

Write-Host "AWS CLI Version: $awsVersion" -ForegroundColor Green
Write-Host ""

# Check if data file exists
$dataFile = "sample-data\student-social-media-usage.csv"
if (-not (Test-Path $dataFile)) {
    Write-Host "ERROR: Data file not found: $dataFile" -ForegroundColor Red
    Write-Host "Please ensure the sample-data folder and CSV file exist" -ForegroundColor Yellow
    exit 1
}

Write-Host "Data file found: $dataFile" -ForegroundColor Green
Write-Host ""

# Upload data to S3
Write-Host "Step 1: Uploading data to S3..." -ForegroundColor Yellow
Write-Host "Bucket: s3://$BUCKET_NAME/raw/" -ForegroundColor Cyan

$uploadResult = aws s3 cp $dataFile "s3://$BUCKET_NAME/raw/" --region $REGION 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to upload data to S3" -ForegroundColor Red
    Write-Host $uploadResult -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  1. AWS credentials not configured (run: aws configure)" -ForegroundColor Yellow
    Write-Host "  2. Bucket doesn't exist or wrong region" -ForegroundColor Yellow
    Write-Host "  3. No permissions to upload to S3" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Data uploaded successfully!" -ForegroundColor Green
Write-Host ""

# Verify upload
Write-Host "Step 2: Verifying upload..." -ForegroundColor Yellow
$listResult = aws s3 ls "s3://$BUCKET_NAME/raw/" --region $REGION 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Files in raw/ folder:" -ForegroundColor Green
    Write-Host $listResult -ForegroundColor Cyan
} else {
    Write-Host "Warning: Could not list S3 contents" -ForegroundColor Yellow
}
Write-Host ""

# Run Glue Crawler
Write-Host "Step 3: Running Glue Crawler to catalog data..." -ForegroundColor Yellow
Write-Host "Crawler: $CRAWLER_NAME" -ForegroundColor Cyan

$crawlerStart = aws glue start-crawler --name $CRAWLER_NAME --region $REGION 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Failed to start Glue crawler" -ForegroundColor Yellow
    Write-Host $crawlerStart -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You can manually start the crawler in AWS Console:" -ForegroundColor Cyan
    Write-Host "https://console.aws.amazon.com/glue/home?region=$REGION#/v2/data-catalog/crawlers" -ForegroundColor Cyan
} else {
    Write-Host "✓ Crawler started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "The crawler is now scanning your S3 data..." -ForegroundColor Cyan
    Write-Host "This may take 1-3 minutes to complete" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Next Steps" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Wait for crawler to finish (check status):" -ForegroundColor Yellow
Write-Host "   aws glue get-crawler --name $CRAWLER_NAME --region $REGION --query 'Crawler.State'" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. After crawler finishes, check tables in Athena:" -ForegroundColor Yellow
Write-Host "   https://console.aws.amazon.com/athena/home?region=$REGION" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Test query in your app or run:" -ForegroundColor Yellow
Write-Host "   .\test-api.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ Upload Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
