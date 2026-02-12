# Fix IAM Permissions for Lambda and Athena
# This script ensures all required permissions are properly configured

$ErrorActionPreference = "Stop"

Write-Host "=== Fixing IAM Permissions for Lambda and Athena ===" -ForegroundColor Cyan
Write-Host ""

# ============================================
# Part 1: Update Lambda IAM Role Policy
# ============================================

Write-Host "[1/4] Updating Lambda IAM Role Policy..." -ForegroundColor Yellow

$lambdaPolicy = @{
    Version = "2012-10-17"
    Statement = @(
        @{
            Effect = "Allow"
            Action = @(
                "athena:StartQueryExecution"
                "athena:GetQueryExecution"
                "athena:GetQueryResults"
                "athena:StopQueryExecution"
                "athena:GetWorkGroup"
                "athena:ListWorkGroups"
                "athena:ListQueryExecutions"
                "athena:BatchGetNamedQuery"
            )
            Resource = "*"
        }
        @{
            Effect = "Allow"
            Action = @(
                "s3:GetObject"
                "s3:PutObject"
                "s3:DeleteObject"
                "s3:ListBucket"
                "s3:GetBucketLocation"
            )
            Resource = @(
                "arn:aws:s3:::student-socialmedia-datalake"
                "arn:aws:s3:::student-socialmedia-datalake/*"
            )
        }
        @{
            Effect = "Allow"
            Action = @(
                "logs:CreateLogGroup"
                "logs:CreateLogStream"
                "logs:PutLogEvents"
                "logs:DescribeLogStreams"
            )
            Resource = "arn:aws:logs:*:*:log-group:/aws/lambda/*"
        }
        @{
            Effect = "Allow"
            Action = @(
                "glue:GetDatabase"
                "glue:GetTable"
                "glue:GetPartitions"
                "glue:BatchGetPartition"
                "glue:CreateTable"
                "glue:UpdateTable"
            )
            Resource = "*"
        }
    )
}

$policyJson = $lambdaPolicy | ConvertTo-Json -Depth 10

Write-Host "  - Applying Lambda IAM policy..."
$result = aws iam put-role-policy `
    --role-name lambda-athena-s3-role `
    --policy-name LambdaAthenaFullAccess `
    --policy-document $policyJson

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Lambda IAM policy updated successfully" -ForegroundColor Green
} else {
    Write-Error "Failed to update Lambda IAM policy: $result"
}

# ============================================
# Part 2: Update S3 Bucket Policy for Athena
# ============================================

Write-Host ""
Write-Host "[2/4] Updating S3 Bucket Policy for Athena..." -ForegroundColor Yellow

$bucketPolicy = @{
    Version = "2012-10-17"
    Statement = @(
        @{
            Sid = "AllowAthenaToWriteQueryResults"
            Effect = "Allow"
            Principal = @{ Service = "athena.amazonaws.com" }
            Action = @(
                "s3:GetObject"
                "s3:PutObject"
                "s3:DeleteObject"
                "s3:ListBucket"
                "s3:GetBucketLocation"
            )
            Resource = @(
                "arn:aws:s3:::student-socialmedia-datalake"
                "arn:aws:s3:::student-socialmedia-datalake/*"
            )
            Condition = @{
                StringEquals = @{
                    "aws:SourceAccount" = "149901571820"
                }
            }
        }
        @{
            Sid = "AllowLambdaRoleToAccess"
            Effect = "Allow"
            Principal = @{ AWS = "arn:aws:iam::149901571820:role/lambda-athena-s3-role" }
            Action = @(
                "s3:GetObject"
                "s3:PutObject"
                "s3:DeleteObject"
                "s3:ListBucket"
                "s3:GetBucketLocation"
            )
            Resource = @(
                "arn:aws:s3:::student-socialmedia-datalake"
                "arn:aws:s3:::student-socialmedia-datalake/*"
            )
        }
    )
}

$bucketPolicyJson = $bucketPolicy | ConvertTo-Json -Depth 10

Write-Host "  - Applying S3 bucket policy..."
$result = aws s3api put-bucket-policy `
    --bucket student-socialmedia-datalake `
    --policy-document $bucketPolicyJson

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ S3 bucket policy updated successfully" -ForegroundColor Green
} else {
    Write-Error "Failed to update S3 bucket policy: $result"
}

# ============================================
# Part 3: Verify Athena WorkGroup Configuration
# ============================================

Write-Host ""
Write-Host "[3/4] Verifying Athena WorkGroup Configuration..." -ForegroundColor Yellow

Write-Host "  - Checking if workgroup exists..."
$workgroupResult = aws athena get-work-group --work-group primary 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ WorkGroup 'primary' exists" -ForegroundColor Green
    $workgroupConfig = $workgroupResult | ConvertFrom-Json
    $outputLocation = $workgroupConfig.WorkGroupConfiguration.ResultConfiguration.OutputLocation

    if ($outputLocation) {
        Write-Host "    Output location: $outputLocation" -ForegroundColor Cyan
    } else {
        Write-Warning "    No output location configured for workgroup"
        Write-Host "    Setting output location..."
        aws athena update-work-group `
            --work-group primary `
            --result-configuration OutputLocation="s3://student-socialmedia-datalake/athena-results/" 2>&1 | Out-Host
    }
} else {
    Write-Warning "  ! WorkGroup 'primary' check failed or doesn't exist"
    Write-Host "    This is OK - Athena will use default settings"
}

# ============================================
# Part 4: Verify Lambda Function Configuration
# ============================================

Write-Host ""
Write-Host "[4/4] Verifying Lambda Function Configuration..." -ForegroundColor Yellow

Write-Host "  - Checking Lambda function environment variables..."
$lambdaResult = aws lambda get-function-configuration `
    --function-name athena-query-student 2>&1

if ($LASTEXITCODE -eq 0) {
    $config = $lambdaResult | ConvertFrom-Json

    Write-Host "  ✓ Lambda function exists" -ForegroundColor Green
    Write-Host "    Runtime: $($config.Runtime)"
    Write-Host "    Timeout: $($config.Timeout)s"
    Write-Host "    Memory: $($config.MemorySize)MB"

    Write-Host "    Environment variables:"
    foreach ($envVar in $config.Environment.Variables.GetEnumerator()) {
        Write-Host "      - $($envVar.Key): $($envVar.Value)"
    }

    # Verify required env vars
    $requiredVars = @("DATABASE_NAME", "S3_BUCKET", "RESULTS_PATH")
    $missingVars = @()

    foreach ($var in $requiredVars) {
        if (-not $config.Environment.Variables.$var) {
            $missingVars += $var
        }
    }

    if ($missingVars.Count -gt 0) {
        Write-Warning "    Missing environment variables: $($missingVars -join ', ')"
        Write-Host "    These should be set in Terraform configuration"
    } else {
        Write-Host "    All required environment variables present" -ForegroundColor Green
    }
} else {
    Write-Error "Lambda function 'athena-query-student' not found: $lambdaResult"
}

Write-Host ""
Write-Host "=== IAM Permissions Fix Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  1. Lambda IAM Role updated with full Athena and S3 permissions"
Write-Host "  2. S3 Bucket Policy updated with GetBucketLocation"
Write-Host "  3. Athena WorkGroup configuration verified"
Write-Host "  4. Lambda function configuration verified"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Run: rebuild-lambda.bat (to update Lambda with latest code)"
Write-Host "  2. Run: test-api.ps1 (to test the API)"
Write-Host "  3. If still failing, check CloudWatch logs for Lambda"

