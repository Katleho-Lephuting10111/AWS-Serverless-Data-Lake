# AWS Serverless Data Lake - Quick Setup Guide

## Problem Solved

The Terraform error occurred because you ran `terraform` from the **root directory** which included both:
- `student-datalake/main.tf` (the correct file)
- `student-datalake/complete_infrastructure.tf` (duplicate file I created)

## Solution

### Step 1: Delete the Duplicate File

Open PowerShell and run:

```powershell
Remove-Item "c:\Users\user\Desktop\PROJECT Y\PROJECTS\AWS Serveless Data Lake\AWS-Serverless-Data-Lake\student-datalake\complete_infrastructure.tf"
```

Or manually delete this file in File Explorer:
```
student-datalake/complete_infrastructure.tf
```

### Step 2: Run Terraform from Correct Directory

```powershell
cd "c:\Users\user\Desktop\PROJECT Y\PROJECTS\AWS Serveless Data Lake\AWS-Serverless-Data-Lake\student-datalake"
terraform init
terraform plan
terraform apply
```

### Step 3: Verify Files in student-datalake Directory

After cleanup, you should have only these Terraform files:
```
student-datalake/
├── main.tf           ✓ KEEP - main configuration
├── variables.tf      ✓ KEEP - variables
├── outputs.tf        ✓ KEEP - outputs
├── iam_role.tf       ✓ KEEP - IAM roles
├── lambda.tf         ✓ KEEP - Lambda function
├── api_gateway.tf    ✓ KEEP - API Gateway
├── frontend.tf       ✓ KEEP - Frontend S3 hosting
├── lambda_permission.tf ✓ KEEP - Lambda permissions
└── *.tf.bak         ✗ Can be deleted
complete_infrastructure.tf  ✗ DELETE THIS
```

## What Each File Does

| File | Purpose |
|------|---------|
| `main.tf` | S3 bucket, Glue database, crawler, IAM roles, Lambda, API Gateway |
| `variables.tf` | Configuration variables (region, bucket name) |
| `outputs.tf` | API endpoint, Lambda ARN outputs |
| `lambda.tf` | Lambda function configuration |
| `api_gateway.tf` | API Gateway endpoints |
| `iam_role.tf` | IAM roles and policies |
| `frontend.tf` | S3 static website hosting |
| `lambda_permission.tf` | API Gateway invoke permissions |

## Manual Deployment (If Terraform Still Fails)

If you prefer to use AWS Console instead:

1. **S3 Bucket**: Create bucket manually in AWS Console
2. **Glue Database**: Create via Athena console
3. **Lambda**: Create function with Python 3.11 runtime
4. **API Gateway**: Create REST API and connect to Lambda
5. **IAM**: Create roles with appropriate policies

## After Deployment

1. Get API endpoint from Terraform output or AWS Console
2. Update frontend: Add `VITE_API_BASE_URL=https://your-api-id.execute-api.region.amazonaws.com/dev` to `.env.local`
3. Test API: `https://your-api-id.execute-api.region.amazonaws.com/dev/health`

## Need Help?

- AWS Console: https://console.aws.amazon.com/
- Terraform Docs: https://developer.hashicorp.com/terraform/docs
- AWS Athena: https://docs.aws.amazon.com/athena/latest/ug/

