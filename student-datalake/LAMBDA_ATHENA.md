# Athena Query Lambda Function Documentation

This document describes the AWS Lambda function for executing SQL queries via Amazon Athena.

## Overview

The Lambda function provides a serverless interface to execute SQL queries against data stored in S3 and cataloged in AWS Glue. It's designed to be called via API Gateway from frontend applications.

## Architecture

```
Frontend App → API Gateway → Lambda → Athena → S3/Glue
                         ↓
                    Results (JSON)
```

## Features

- **Query Validation**: Prevents dangerous SQL operations
- **Async Execution**: Non-blocking query execution with polling
- **Timeout Management**: Configurable wait times (1-900 seconds)
- **Result Pagination**: Limits returned rows (default: 1000)
- **Error Handling**: Comprehensive error responses
- **JSON Serialization**: Handles various data types

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_NAME` | Yes | - | Glue database name |
| `S3_BUCKET` | Yes | - | S3 bucket for query results |
| `RESULTS_PATH` | No | `s3://{S3_BUCKET}/athena-results/` | S3 path for results |
| `MAX_WAIT_TIME` | No | 60 | Default max wait time in seconds |

## Input Format

### API Gateway Event

```json
{
  "body": "{\"query\": \"SELECT * FROM table LIMIT 10\", \"maxWaitTime\": 60}"
}
```

### Direct Lambda Invocation

```json
{
  "query": "SELECT * FROM table LIMIT 10",
  "maxWaitTime": 60,
  "outputLocation": "s3://bucket/custom-path/"
}
```

## Parameter Details

### `query` (Required)

SQL query string to execute.

```json
{
  "query": "SELECT platform, AVG(hours) FROM usage_data GROUP BY platform"
}
```

**Constraints:**
- Must be non-empty string
- Maximum 262,144 bytes
- Dangerous patterns are blocked (DROP, TRUNCATE, etc.)

### `maxWaitTime` (Optional)

Maximum time to wait for query completion.

```json
{
  "maxWaitTime": 120
}
```

**Valid range:** 1-900 seconds

### `outputLocation` (Optional)

Custom S3 path for query results.

```json
{
  "outputLocation": "s3://my-bucket/custom-results/"
}
```

**Default:** Uses `RESULTS_PATH` environment variable

## Output Format

### Success Response (200)

```json
{
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  "body": {
    "message": "Query executed successfully",
    "queryExecutionId": "abc123-def456",
    "state": "SUCCEEDED",
    "rows": [
      {"platform": "Instagram", "avg_hours": "8.5"},
      {"platform": "TikTok", "avg_hours": "9.2"}
    ],
    "columnMetadata": [
      {"name": "platform", "type": "varchar"},
      {"name": "avg_hours", "type": "float"}
    ],
    "rowCount": 2,
    "dataScannedInBytes": 12345,
    "executionTimeInMillis": 500
  }
}
```

### Error Responses

#### Bad Request (400)

```json
{
  "statusCode": 400,
  "body": {
    "error": "Invalid request",
    "message": "Query must be a non-empty string"
  }
}
```

#### Timeout (408)

```json
{
  "statusCode": 408,
  "body": {
    "error": "Query timeout",
    "message": "Query did not complete within 60 seconds"
  }
}
```

#### Server Error (500)

```json
{
  "statusCode": 500,
  "body": {
    "error": "Internal server error",
    "message": "An unexpected error occurred"
  }
}
```

## Usage Examples

### cURL

```bash
curl -X POST \
  https://your-api.execute-api.region.amazonaws.com/dev/query \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "SELECT * FROM student_usage LIMIT 10"
  }'
```

### JavaScript (Frontend)

```javascript
async function executeQuery(sql) {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql })
  })
  
  const result = await response.json()
  return result.body
}
```

### Python (Boto3)

```python
import boto3
import json

def lambda_handler(event, context):
    athena = boto3.client('athena')
    
    response = athena.start_query_execution(
        QueryString="SELECT * FROM table LIMIT 10",
        QueryExecutionContext={'Database': 'my_database'},
        ResultConfiguration={'OutputLocation': 's3://bucket/results/'}
    )
    
    return response['QueryExecutionId']
```

## Query Examples

### Basic SELECT

```sql
SELECT * FROM student_data LIMIT 100
```

### Aggregation

```sql
SELECT 
  platform,
  COUNT(*) as user_count,
  AVG(hours_per_day) as avg_usage,
  AVG(gpa_impact) as avg_gpa_impact
FROM student_social_media_usage
GROUP BY platform
ORDER BY user_count DESC
```

### JOIN

```sql
SELECT 
  u.student_id,
  u.platform,
  u.hours_per_day,
  m.mental_health_score,
  m.sleep_hours
FROM student_social_media_usage u
JOIN student_mental_health m ON u.student_id = m.student_id
WHERE u.hours_per_day > 5
LIMIT 50
```

### Date Filtering

```sql
SELECT 
  DATE(ingestion_time) as date,
  COUNT(*) as records
FROM student_data
WHERE ingestion_time >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
GROUP BY DATE(ingestion_time)
ORDER BY date DESC
```

## Security Considerations

### Query Restrictions

The following patterns are blocked:

| Pattern | Reason |
|---------|--------|
| `DROP DATABASE` | Data loss risk |
| `DROP TABLE CASCADE` | Data loss risk |
| `TRUNCATE TABLE` | Data loss risk |
| `GRANT` | Permission changes |
| `REVOKE` | Permission changes |
| `ALTER SYSTEM` | Configuration changes |
| `CREATE ROLE` | Privilege escalation |
| `EXECUTE AS` | Impersonation |

### Best Practices

1. **Use Least Privilege IAM Role**
   ```json
   {
     "Effect": "Allow",
     "Action": ["athena:StartQueryExecution", "athena:GetQueryResults"],
     "Resource": "*"
   }
   ```

2. **Limit Database Access**
   - Use specific database name in environment variable
   - Restrict IAM policies to specific databases

3. **Set Query Result Expiration**
   ```sql
   ALTER TABLE table SET TBLPROPERTIES('expire'='30')
   ```

4. **Enable Query Logging**
   - CloudTrail for audit
   - Athena work groups for query history

## Performance Optimization

### Query Best Practices

```sql
-- Use LIMIT for exploration
SELECT * FROM table LIMIT 100

-- Filter early
SELECT * FROM table WHERE date > '2024-01-01' LIMIT 100

-- Use CTEs for complex queries
WITH filtered AS (
  SELECT * FROM table WHERE condition
)
SELECT * FROM filtered
```

### Lambda Configuration

```yaml
Memory: 256 MB (minimum)
Timeout: 60-300 seconds
Runtime: Python 3.9+

# For large result sets:
Timeout: 300 seconds
```

### Athena Work Group Configuration

Create a dedicated work group:

```hcl
resource "aws_athena_work_group" "api_queries" {
  name = "api-queries"

  configuration {
    enforce_work_group_configuration = true
    result_configuration {
      output_location = "s3://bucket/athena-results/"
      encryption_configuration {
        encryption_option = "SSE_S3"
      }
    }
    query_results_indication = "ENABLED"
  }
}
```

## Monitoring

### CloudWatch Metrics

- `QueryExecutionTime`: Time to execute query
- `DataScanned`: Amount of data scanned
- `QueryCount`: Number of queries
- `ErrorCount`: Failed queries

### CloudWatch Logs

```python
import logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

logger.info(f"Query started: {query_execution_id}")
logger.info(f"Query completed: {execution_time}ms")
```

### Athena Query History

```sql
SELECT * FROM "awsdatacatalog"."information_schema".query_history
WHERE query_execution_id = 'your-id'
```

## Troubleshooting

### Query Returns Empty Results

```sql
-- Check if table has data
SELECT COUNT(*) FROM table_name

-- Verify table location
DESCRIBE FORMATTED table_name
```

### Timeout Errors

```bash
# Increase maxWaitTime in request
{
  "query": "...",
  "maxWaitTime": 300
}

# Or optimize query
SELECT * FROM table LIMIT 100
```

### Access Denied

```json
{
  "error": "Access denied",
  "message": "User is not authorized to perform: athena:StartQueryExecution"
}
```

**Solution:** Update IAM policy:

```json
{
  "Effect": "Allow",
  "Action": [
    "athena:StartQueryExecution",
    "athena:GetQueryExecution",
    "athena:GetQueryResults"
  ],
  "Resource": [
    "arn:aws:athena:*:*:workgroup/*",
    "arn:aws:athena:*:*:databases/*"
  ]
}
```

### Invalid S3 Location

```json
{
  "error": "Invalid S3 location",
  "message": "The S3 location provided is not valid"
}
```

**Solution:** Verify bucket exists and Lambda has access:

```hcl
resource "aws_iam_policy" "s3_access" {
  policy = jsonencode({
    Effect = "Allow",
    Action = ["s3:PutObject", "s3:GetObject", "s3:ListBucket"],
    Resource = ["arn:aws:s3:::bucket", "arn:aws:s3:::bucket/*"]
  })
}
```

## Deployment

### Update Lambda in Terraform

```bash
cd student-datalake
terraform apply -var="lambda_zip=athena_query.zip"
```

### Create Lambda ZIP

```bash
cd student-datalake
zip -r athena_query.zip athena_query.py
```

### Lambda Permissions

```hcl
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name  = aws_lambda_function.athena_query.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}
```

## Testing

### Unit Tests

```python
import pytest
from athena_query import validate_query, format_response

def test_validate_query():
    assert validate_query("SELECT * FROM table") == (True, "")
    assert validate_query("") == (False, "Query must be a non-empty string")
    assert validate_query("DROP TABLE users") == (False, "Query contains disallowed pattern")

def test_format_response():
    response = format_response(200, {"data": "test"})
    assert response["statusCode"] == 200
    assert "Access-Control-Allow-Origin" in response["headers"]
```

### Integration Test

```python
def test_full_query_execution():
    event = {
        "body": json.dumps({
            "query": "SELECT 1 as test",
            "maxWaitTime": 30
        })
    }
    
    response = lambda_handler(event, None)
    
    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["state"] == "SUCCEEDED"
    assert body["rowCount"] == 1
```

## Cost Optimization

### Reduce Data Scanned

```sql
-- Partitioned queries
SELECT * FROM table WHERE year = 2024 AND month = 1

-- Column projection
SELECT id, name FROM table  -- Instead of SELECT *
```

### Use Compression

```sql
-- Data stored as Parquet/ORC
SELECT * FROM table_parquet
```

### Query Caching

Enable Athena query results caching via work group settings.

## Quick Reference

| Command | Value |
|---------|-------|
| Runtime | Python 3.9+ |
| Memory | 128-256 MB |
| Timeout | 60-300 seconds |
| Max query size | 262,144 bytes |
| Max wait time | 900 seconds |
| Max results | 1000 rows |

