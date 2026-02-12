# AWS Serverless Data Lake - Setup Guide

## Prerequisites

Before starting, ensure you have:

1. **Terraform installed** (v1.0+)
   ```bash
   terraform -v
   ```

2. **AWS CLI configured** with appropriate credentials
   ```bash
   aws configure
   # or
   aws sso login
   ```

3. **Python 3.9+** for Lambda packaging
   ```bash
   python --version
   ```

4. **ZIP utility** for Lambda deployment
   - Windows: Built-in or use PowerShell
   - Linux/Mac: `zip` command

---

## Quick Setup

### 1. Install Terraform (Windows)

```powershell
# Using Chocolatey
choco install terraform -y

# Or download manually from https://www.terraform.io/downloads
```

### 2. Verify AWS Credentials

```powershell
aws sts get-caller-identity
```

You should see your AWS account ID and IAM ARN.

### 3. Deploy Infrastructure

```powershell
cd student-datalake

# Initialize Terraform
terraform init

# View planned changes
terraform plan

# Apply changes (type 'yes' to confirm)
terraform apply
```

---

## Common Errors & Solutions

### Error: "Error: Could not locate plugin"

```
Error: Could not locate plugin
Terraform executable not found in: C:\Program Files\Git\usr\bin
```

**Solution:**
```powershell
# Add Terraform to PATH
$env:PATH += ";C:\Program Files\Terraform"

# Or use full path
& "C:\Program Files\Terraform\terraform.exe" init
```

### Error: "Error: No valid credential sources"

```
Error: No valid credential sources for provider.aws found.
```

**Solution:**
```powershell
# Option 1: Set environment variables
$env:AWS_ACCESS_KEY_ID="your-access-key"
$env:AWS_SECRET_ACCESS_KEY="your-secret-key"
$env:AWS_DEFAULT_REGION="eu-west-1"

# Option 2: Use AWS SSO
aws sso login --profile default

# Option 3: Use AWS CLI config
aws configure
```

### Error: "Error: resource limit exceeded"

```
Error: LimitExceededException: Account limit exceeded
```

**Solution:**
- Some resources may already exist in your account
- Delete existing resources or use `terraform plan` to see conflicts
- Request AWS limit increases if needed

### Error: "Error: Invalid S3 bucket name"

```
Error: Invalid bucket name: bucket names must match regex
```

**Solution:**
```hcl
# Use lowercase, hyphens only, no underscores
variable "bucket_name" {
  default = "student-socialmedia-datalake"  # ✓ Valid
  # default = "student_social_media_datalake"  # ✗ Invalid
}
```

---

## Manual Deployment (If Terraform Fails)

### Step 1: Create S3 Bucket

```powershell
aws s3 mb s3://student-socialmedia-datalake --region eu-west-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket student-socialmedia-datalake \
  --versioning-configuration Status=Enabled
```

### Step 2: Create Glue Database

```powershell
aws glue create-database \
  --database-input Name=student_db \
  --region eu-west-1
```

### Step 3: Create Lambda Role

```powershell
# Create trust policy
@'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"Service": "lambda.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }
  ]
}
' | Out-File -FilePath trust-policy.json

aws iam create-role \
  --role-name lambda-athena-s3-role \
  --assume-role-policy-document file://trust-policy.json

# Attach policies
aws iam attach-role-policy \
  --role-name lambda-athena-s3-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# Create custom policy
aws iam put-role-policy \
  --role-name lambda-athena-s3-role \
  --policy-name lambda-athena-policy \
  --policy-document file://s3-athena-policy.json
```

### Step 4: Create Lambda Function

```powershell
# Package Lambda
cd student-datalake
Compress-Archive -Path lambda_enhanced.py -DestinationPath lambda.zip -Force

# Create Lambda
aws lambda create-function \
  --function-name athena-query-student \
  --runtime python3.11 \
  --role arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/lambda-athena-s3-role \
  --handler lambda_enhanced.lambda_handler \
  --zip-file fileb://lambda.zip \
  --environment Variables="{DATABASE_NAME=student_db,S3_BUCKET=student-socialmedia-datalake,RESULTS_PATH=s3://student-socialmedia-datalake/athena-results/}" \
  --region eu-west-1
```

### Step 5: Create API Gateway

```powershell
# Create REST API
aws apigateway create-rest-api \
  --name athena-query-api \
  --region eu-west-1

# Get API ID (replace with your API ID from output)
$apiId = (aws apigateway get-rest-apis --query "items[0].id" --output text)

# Create resource
aws apigateway create-resource \
  --rest-api-id $apiId \
  --parent-id $(aws apigateway get-resources --rest-api-id $apiId --query "items[0].id" --output text) \
  --path-part query \
  --region eu-west-1

# Create method
aws apigateway put-method \
  --rest-api-id $apiId \
  --resource-id $(aws apigateway get-resources --rest-api-id $apiId --query "items[?pathPart=='query'].id" --output text) \
  --http-method POST \
  --authorization-type "NONE" \
  --region eu-west-1

# Integrate with Lambda
aws apigateway put-integration \
  --rest-api-id $apiId \
  --resource-id $(aws apigateway get-resources --rest-api-id $apiId --query "items[?pathPart=='query'].id" --output text) \
  --http-method POST \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri arn:aws:apigateway:eu-west-1:lambda:path/2015-03-31/functions/arn:aws:lambda:eu-west-1:$(aws sts get-caller-identity --query Account --output text):function:athena-query-student/invocations \
  --region eu-west-1

# Create deployment
aws apigateway create-deployment \
  --rest-api-id $apiId \
  --stage-name dev \
  --region eu-west-1
```

### Step 6: Give API Gateway Permission to Invoke Lambda

```powershell
aws lambda add-permission \
  --function-name athena-query-student \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn arn:aws:execute-api:eu-west-1:$(aws sts get-caller-identity --query Account --output text):$apiId/dev/POST/query
```

---

## Test the API

### Health Check
```powershell
Invoke-RestMethod -Method Get -Uri "https://$apiId.execute-api.eu-west-1.amazonaws.com/dev/health"
```

### Custom Query
```powershell
$body = @{query = "SELECT platform, AVG(hours_per_day) FROM student_social_media_usage GROUP BY platform LIMIT 10"} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "https://$apiId.execute-api.eu-west-1.amazonaws.com/dev/query" -Body $body -ContentType "application/json"
```

### Template Query
```powershell
$body = @{queryType = "gpa_by_platform"} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "https://$apiId.execute-api.eu-west-1.amazonaws.com/dev/query/gpa_by_platform" -Body $body -ContentType "application/json"
```

---

## Update Frontend Environment

After deployment, add the API URL to your frontend:

```bash
# Create .env.local in Frontend directory
echo "VITE_API_BASE_URL=https://$apiId.execute-api.eu-west-1.amazonaws.com/dev" > Frontend/.env.local
```

---

## Verify Deployment

```powershell
# Check Lambda function exists
aws lambda get-function --function-name athena-query-student

# Check API Gateway exists
aws apigateway get-rest-apis --query "items[?name=='athena-query-api']"

# Check IAM roles
aws iam list-roles --query "Roles[?RoleName=='lambda-athena-s3-role']"
```

