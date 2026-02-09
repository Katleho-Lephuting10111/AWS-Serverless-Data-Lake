# AWS Cost Management Guide

This guide covers how to prevent unexpected charges and optimize costs for your AWS Serverless Data Lake project.

## AWS Free Tier Overview

AWS offers a **Free Tier** that includes:
- **Lambda**: 1M free requests/month + 400,000 GB-seconds compute time
- **S3**: 5GB standard storage, 20,000 GET requests
- **Glue**: 1M SPOT/1M DSY/OPS free/month
- **Athena**: 10GB scanned/month
- **API Gateway**: 1M REST API calls/month
- **CloudWatch**: 10 custom metrics, 1M API requests

**Most projects stay within free tier for development.**

## Cost-Saving Strategies

### 1. **Use AWS Free Tier Effectively**

| Service | Free Allocation | Your Usage |
|---------|----------------|------------|
| Lambda | 1M requests, 400K GB-seconds | Serverless - stays free |
| S3 | 5GB storage, 20K GETs | Use lifecycle rules |
| Athena | 10GB scanned/month | Query efficiently |
| API Gateway | 1M calls/month | Low traffic app |

### 2. **S3 Lifecycle Policies**

Prevent data accumulation with automatic transitions:

```hcl
# student-datalake/main.tf
resource "aws_s3_bucket_lifecycle_configuration" "cost_optimization" {
  bucket = aws_s3_bucket.datalake.bucket

  rule {
    id     = "archive-raw-data"
    status = "Enabled"

    filter {
      prefix = "raw/"
    }

    # Move to Glacier after 30 days
    transition {
      days          = 30
      storage_class = "GLACIER"
    }

    # Delete after 90 days
    expiration {
      days = 90
    }
  }

  rule {
    id     = "cleanup-temp"
    status = "Enabled"

    filter {
      prefix = "temp/"
    }

    expiration {
      days = 7
    }
  }

  rule {
    id     = "archive-processed"
    status = "Enabled"

    filter {
      prefix = "processed/"
    }

    transition {
      days          = 90
      storage_class = "GLACIER_DEEP"
    }
  }
}
```

### 3. **Athena Query Optimization**

Reduce data scanned to stay under limits:

```sql
-- Only select needed columns
SELECT id, platform, hours_per_day FROM usage_data LIMIT 100

-- Use partitions
SELECT * FROM usage_data WHERE year = '2024' LIMIT 100

-- Compress data (use Parquet/ORC)
SELECT * FROM usage_data_parquet LIMIT 100
```

### 4. **Lambda Timeout Configuration**

Set appropriate timeouts:

```hcl
# lambda.tf
resource "aws_lambda_function" "athena_query" {
  timeout = 60  # Don't over-provision
  memory_size = 256  # Right-size for your needs
}
```

### 5. **CloudWatch Logs Retention**

Reduce log storage costs:

```hcl
# All log groups
resource "aws_cloudwatch_log_group" "athena_lambda" {
  name              = "/aws/lambda/athena-query-student"
  retention_in_days = 7  # Reduce from default (never expires)
}

resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "API-Gateway-Execution-Logs_athena-query-api/dev"
  retention_in_days = 3  # Shorter for API logs
}
```

### 6. **Glue Crawler Scheduling**

Don't run crawlers unnecessarily:

```hcl
resource "aws_glue_crawler" "student_crawler" {
  name          = "student-crawler"
  schedule      = "cron(0 12 ? * SUN *)"  # Weekly on Sunday
  # Or disable: schedule = null
}
```

## Budget Alerts

### Set Up AWS Budgets

```hcl
# budgets.tf
resource "aws_budgets_budget" "monthly_cost" {
  name              = "monthly-cost-budget"
  budget_type       = "COST"
  limit_amount      = "10.00"  # $10/month limit
  limit_unit        = "USD"
  time_unit         = "MONTHLY"
  notification {
    comparison_operator = "GREATER_THAN"
    threshold          = 80
    threshold_type     = "PERCENTAGE"
    notification_type  = "ACTUAL"
    subscriber_email_addresss = ["your-email@example.com"]
  }
}
```

### CloudWatch Billing Alarms

```hcl
# cloudwatch_billing.tf
resource "aws_cloudwatch_metric_alarm" "estimated_charges" {
  alarm_name          = "EstimatedCharges"
  metric_name         = "EstimatedCharges"
  namespace           = "AWS/Billing"
  statistic           = "Maximum"
  period              = 21600  # 6 hours
  evaluation_periods  = 1
  threshold           = 10.00
  comparison_operator = "GreaterThanThreshold"

  dimensions = {
    ServiceName = "AmazonS3"
  }

  alarm_actions = [aws_sns_topic.billing_alerts.arn]
}
```

## Resources to Delete to Stop Charges

### Order of Deletion (Terraform)

```bash
# 1. Delete API Gateway
terraform destroy -target=aws_api_gateway_deployment.athena_api_deployment
terraform destroy -target=aws_api_gateway_rest_api.athena_api

# 2. Delete Lambda function
terraform destroy -target=aws_lambda_function.athena_query

# 3. Delete IAM roles (optional - may have dependencies)
terraform destroy -target=aws_iam_role.athena_lambda

# 4. Delete Glue resources
terraform destroy -target=aws_glue_crawler.student_crawler
terraform destroy -target=aws_glue_catalog_database.student_db

# 5. Delete S3 buckets (manually - Terraform won't delete with content)
aws s3 rm s3://student-socialmedia-datalake --recursive
aws s3 rb s3://student-socialmedia-datalake --force

# 6. Delete CloudWatch log groups
aws logs delete-log-group --log-group-name /aws/lambda/athena-query-student
aws logs delete-log-group --log-group-name API-Gateway-Execution-Logs_athena-query-api/dev

# 7. Full cleanup
terraform destroy
```

### Manual Deletion Checklist

1. **S3 Buckets**: Empty and delete buckets
   - `student-socialmedia-datalake`
   - `student-datalake-frontend` (if created)

2. **Glue Databases**: Delete from AWS Console

3. **Lambda Functions**: Delete from Lambda console

4. **API Gateway**: Delete API from API Gateway console

5. **CloudWatch**: Delete log groups

6. **IAM**: Delete custom roles (except AWS managed)

7. **CloudFront**: Delete distributions (if created)

## Cost Estimation by Service

### Monthly Cost Estimate (Always-Free Tier Eligible)

| Service | Free Tier | Your Cost |
|---------|-----------|-----------|
| Lambda | 1M requests | $0.00 |
| S3 | 5GB storage | $0.00-0.50 |
| Athena | 10GB scanned | $0.00 |
| API Gateway | 1M calls | $0.00 |
| Glue Crawler | 1M/min/month | $0.00 |
| CloudWatch | 10 metrics | $0.00 |
| **Total** | | **~$0.00-1.00** |

### Costs When Exceeding Free Tier

| Service | Cost |
|---------|------|
| S3 Storage (beyond 5GB) | $0.023/GB/month |
| Athena (beyond 10GB) | $5.00 per TB scanned |
| Lambda (beyond 400K GB-seconds) | $0.0000166667/GB-second |
| API Gateway (beyond 1M) | $4.25 per million |
| CloudWatch Logs | $0.50/GB ingested |

## Best Practices Checklist

- [ ] Set up AWS Budgets with alerts
- [ ] Configure S3 lifecycle policies
- [ ] Set CloudWatch log retention
- [ ] Use query partitioning in Athena
- [ ] Select only needed columns in SQL
- [ ] Compress data (Parquet format)
- [ ] Delete unused resources
- [ ] Monitor Estimated Charges daily
- [ ] Use consolidated billing (AWS Organizations)

## Monitoring Your Costs

### Daily Checks

```bash
# Check current month estimated charges
aws ce get-cost-and-usage \
  --time-period Start=$(date -d "-1 day" +%Y-%m-01),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics "UnblendedCost"
```

### Cost Explorer

1. Go to AWS Cost Explorer
2. Set date range to "This Month"
3. Filter by service
4. Check for unexpected spikes

## Emergency: Stop All Charges

If you're seeing unexpected charges:

```bash
# 1. Delete everything immediately
cd student-datalake
terraform destroy -auto-approve

# 2. Delete S3 buckets manually
aws s3 ls | grep student
# Delete any remaining buckets

# 3. Delete CloudWatch log groups
aws logs describe-log-groups --query 'logGroups[].logGroupName' --output table

# 4. Check for lingering resources
aws resourcegroupstaggingapi get-resources --tag-filter Key=ManagedBy,Values=Terraform
```

## Estimated Monthly Cost Summary

For a development/student project:

| Configuration | Monthly Cost |
|--------------|--------------|
| Minimal usage (within free tier) | **$0.00** |
| Typical student project | **$0.50-5.00** |
| Heavy usage | **$10.00-50.00** |

**Conclusion**: With proper configuration and the free tier, your data lake should cost **$0-5/month** for development use.

