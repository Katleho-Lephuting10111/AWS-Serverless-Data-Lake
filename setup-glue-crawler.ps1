# Glue Crawler Setup and Management Script
# This script manages the Glue crawler to populate the database with tables

$ErrorActionPreference = "Stop"

Write-Host "=== Glue Crawler Setup ===" -ForegroundColor Cyan
Write-Host ""

$crawlerName = "student-crawler"
$databaseName = "student_db"
$bucketName = "student-socialmedia-datalake"
$region = "eu-west-1"

# ============================================
# Step 1: Check existing crawler status
# ============================================

Write-Host "[1/6] Checking existing crawler status..." -ForegroundColor Yellow

try {
    $crawlerInfo = aws glue get-crawler --name $crawlerName 2>&1 | ConvertFrom-Json

    if ($crawlerInfo.Crawler) {
        Write-Host "  ✓ Crawler '$crawlerName' exists" -ForegroundColor Green
        Write-Host "    State: $($crawlerInfo.Crawler.State)"
        Write-Host "    Role: $($crawlerInfo.Crawler.Role)"
        Write-Host "    Database: $($crawlerInfo.Crawler.DatabaseName)"
        Write-Host "    S3 Target: $($crawlerInfo.Crawler.Targets.S3Targets[0].Path)"
    } else {
        Write-Host "  ! Crawler not found" -ForegroundColor Yellow
        $crawlerInfo = $null
    }
} catch {
    Write-Host "  ! Crawler not found or error checking" -ForegroundColor Yellow
    $crawlerInfo = $null
}

# ============================================
# Step 2: Create crawler if it doesn't exist
# ============================================

if (-not $crawlerInfo) {
    Write-Host ""
    Write-Host "[2/6] Creating Glue crawler..." -ForegroundColor Yellow

    # Get IAM role ARN
    $roleArn = aws iam get-role --role-name AWSGlueServiceRole 2>&1 | ConvertFrom-Json

    if (-not $roleArn.Role) {
        Write-Warning "  ! AWSGlueServiceRole not found, trying to create it..."
        # The role should be created by Terraform, but we can note this
        Write-Warning "  ! Please ensure AWSGlueServiceRole exists with proper permissions"
    } else {
        $roleArn = $roleArn.Role.Arn
        Write-Host "    Role ARN: $roleArn" -ForegroundColor Cyan
    }

    # Create crawler JSON configuration
    $crawlerConfig = @{
        Name = $crawlerName
        Role = "AWSGlueServiceRole"
        DatabaseName = $databaseName
        Description = "Crawler to scan S3 data and create tables in student_db"
        Targets = @{
            S3Targets = @(
                @{
                    Path = "s3://$bucketName/raw/"
                }
            )
        }
        Schedule = $null
        Classifiers = @()
        TablePrefix = ""
        SchemaChangePolicy = @{
            UpdateBehavior = "LOG"
            DeleteBehavior = "LOG"
        }
        LineageConfiguration = @{
            crawlerLineageSettings = "DISABLE"
        }
    } | ConvertTo-Json -Depth 10

    try {
        $null = aws glue create-crawler `
            --cli-input-json $crawlerConfig `
            2>&1

        Write-Host "  ✓ Crawler created successfully" -ForegroundColor Green
    } catch {
        Write-Warning "  ! Could not create crawler (may already exist or permission issue)"
    }
}

# ============================================
# Step 3: Ensure database exists
# ============================================

Write-Host ""
Write-Host "[3/6] Ensuring Glue database exists..." -ForegroundColor Yellow

try {
    $null = aws glue get-database --name $databaseName 2>&1
    Write-Host "  ✓ Database '$databaseName' exists" -ForegroundColor Green
} catch {
    Write-Host "  ! Creating database '$databaseName'..." -ForegroundColor Yellow

    $null = aws glue create-database `
        --database-input @{Name = $databaseName; Description = "Database for student data lake"} `
        2>&1

    Write-Host "  ✓ Database created" -ForegroundColor Green
}

# ============================================
# Step 4: Run the crawler
# ============================================

Write-Host ""
Write-Host "[4/6] Starting Glue crawler..." -ForegroundColor Yellow

try {
    $null = aws glue start-crawler --name $crawlerName 2>&1
    Write-Host "  ✓ Crawler started" -ForegroundColor Green
} catch {
    Write-Warning "  ! Could not start crawler"
}

# ============================================
# Step 5: Wait for crawler to complete
# ============================================

Write-Host ""
Write-Host "[5/6] Waiting for crawler to complete..." -ForegroundColor Yellow

$maxAttempts = 60  # 5 minutes max
$attempt = 0

do {
    $attempt++
    Start-Sleep -Seconds 5

    $status = aws glue get-crawler --name $crawlerName 2>&1 | ConvertFrom-Json

    if ($status.Crawler) {
        $state = $status.Crawler.State
        Write-Host "    Attempt $attempt/$maxAttempts: State=$state" -ForegroundColor Cyan

        if ($state -eq "READY") {
            Write-Host "  ✓ Crawler finished!" -ForegroundColor Green
            break
        }
    }

    if ($attempt -ge $maxAttempts) {
        Write-Warning "  ! Timeout waiting for crawler"
        break
    }
} while ($true)

# ============================================
# Step 6: List tables and verify
# ============================================

Write-Host ""
Write-Host "[6/6] Listing tables in database..." -ForegroundColor Yellow

try {
    $tables = aws glue get-tables --database-name $databaseName 2>&1 | ConvertFrom-Json

    if ($tables.TableList.Count -gt 0) {
        Write-Host "  ✓ Found $($tables.TableList.Count) table(s) in '$databaseName':" -ForegroundColor Green

        foreach ($table in $tables.TableList) {
            Write-Host "    - $($table.Name)" -ForegroundColor White
            Write-Host "      Storage: $($table.StorageDescriptor.Location)" -ForegroundColor DarkGray
        }
    } else {
        Write-Host "  ! No tables found in '$databaseName'" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  Possible reasons:" -ForegroundColor Yellow
        Write-Host "    1. S3 bucket has no data files" -ForegroundColor White
        Write-Host "    2. Crawler hasn't finished scanning" -ForegroundColor White
        Write-Host "    3. Data format not supported" -ForegroundColor White
        Write-Host ""
        Write-Host "  To create sample data, upload CSV/JSON files to:" -ForegroundColor Yellow
        Write-Host "    s3://$bucketName/raw/" -ForegroundColor Cyan
    }
} catch {
    Write-Warning "  ! Could not list tables"
}

# ============================================
# Sample Data Creation (Optional)
# ============================================

Write-Host ""
Write-Host "=== Sample Data Creation ===" -ForegroundColor Cyan

$sampleDataChoice = Read-Host "Would you like to create sample data in S3? (y/n)"

if ($sampleDataChoice -eq "y" -or $sampleDataChoice -eq "Y") {
    Write-Host ""
    Write-Host "Creating sample social media usage data..." -ForegroundColor Yellow

    # Sample CSV data
    $sampleData = @"
student_id,platform,hours_per_day,gpa_impact,sleep_hours,mental_health_score
1,Instagram,8.5,-0.3,6.5,7.2
1,TikTok,9.2,-0.5,5.5,6.8
1,YouTube,7.8,-0.2,6.0,7.5
2,Instagram,6.5,-0.1,7.0,8.0
2,Twitter,5.3,0.0,7.2,8.2
3,TikTok,10.5,-0.8,4.5,5.5
3,Reddit,6.9,-0.2,6.0,7.0
4,YouTube,8.0,-0.3,6.2,7.5
4,Facebook,4.5,0.1,7.5,8.5
5,Instagram,7.5,-0.2,6.8,7.8
5,LinkedIn,5.1,0.2,7.2,8.0
6,TikTok,11.0,-1.0,4.0,5.0
6,Instagram,6.0,-0.1,7.0,8.0
7,YouTube,9.0,-0.4,5.5,6.5
7,Twitter,8.3,-0.3,6.0,7.0
8,Instagram,5.5,0.0,7.5,8.5
8,Facebook,3.5,0.2,8.0,9.0
9,TikTok,12.0,-1.2,3.5,4.5
9,YouTube,6.0,-0.1,6.5,7.5
10,Instagram,7.0,-0.2,6.5,7.5
10,TikTok,8.0,-0.3,6.0,7.0
10,Reddit,5.5,0.0,7.0,8.0
"@

    # Create local sample file
    $sampleFile = Join-Path $env:TEMP "student_social_media_usage.csv"
    $sampleData | Out-File -FilePath $sampleFile -Encoding UTF8

    # Upload to S3
    Write-Host "  Uploading sample data to s3://$bucketName/raw/student_social_media_usage.csv..."
    aws s3 cp $sampleFile "s3://$bucketName/raw/student_social_media_usage.csv" --region $region

    Write-Host "  ✓ Sample data uploaded" -ForegroundColor Green
    Write-Host ""
    Write-Host "  NOTE: Run the crawler again to pick up the new data!" -ForegroundColor Yellow
    Write-Host "    aws glue start-crawler --name $crawlerName" -ForegroundColor White
}

Write-Host ""
Write-Host "=== Glue Crawler Setup Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  1. Crawler: $crawlerName" -ForegroundColor White
Write-Host "  2. Database: $databaseName" -ForegroundColor White
Write-Host "  3. S3 Path: s3://$bucketName/raw/" -ForegroundColor White
Write-Host ""
Write-Host "To manually run the crawler:" -ForegroundColor Cyan
Write-Host "  aws glue start-crawler --name $crawlerName" -ForegroundColor White

