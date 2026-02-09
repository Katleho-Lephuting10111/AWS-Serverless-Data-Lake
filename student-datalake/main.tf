provider "aws" {
  region = var.region
}

# 1. Create S3 bucket
resource "aws_s3_bucket" "datalake" {
  bucket = var.bucket_name
}

# 1a. Enable ACLs on the bucket
resource "aws_s3_bucket_acl" "datalake_acl" {
  bucket              = aws_s3_bucket.datalake.id
  acl                 = "private"
  depends_on          = [aws_s3_bucket_ownership_controls.datalake]
}

# 1b. Configure bucket ownership controls to enable ACLs
resource "aws_s3_bucket_ownership_controls" "datalake" {
  bucket = aws_s3_bucket.datalake.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

# 2. Enable versioning
resource "aws_s3_bucket_versioning" "versioning" {
  bucket = aws_s3_bucket.datalake.id
  versioning_configuration {
    status = "Enabled"
  }
}

# 3. Lifecycle policy (archive raw data after 30 days)
resource "aws_s3_bucket_lifecycle_configuration" "lifecycle" {
  bucket = aws_s3_bucket.datalake.id

  rule {
    id     = "archive-raw-data"
    status = "Enabled"

    filter {
      prefix = "raw/"
    }

    transition {
      days          = 30
      storage_class = "GLACIER"
    }
  }
}

# 4. Create folder structure (prefixes)
resource "aws_s3_object" "raw_folder" {
  bucket = aws_s3_bucket.datalake.id
  key    = "raw/"
}

resource "aws_s3_object" "processed_folder" {
  bucket = aws_s3_bucket.datalake.id
  key    = "processed/"
}

resource "aws_s3_object" "athena_results_folder" {
  bucket = aws_s3_bucket.datalake.id
  key    = "athena-results/"
}

# 5. Glue Database
resource "aws_glue_catalog_database" "student_db" {
  name = "student_db"
}

# 6. Glue Crawler
resource "aws_glue_crawler" "student_crawler" {
  name          = "student-crawler"
  role          = aws_iam_role.glue_service_role.arn
  database_name = aws_glue_catalog_database.student_db.name

  s3_target {
    path = "s3://${var.bucket_name}/raw/"
  }
  depends_on = [aws_iam_role_policy_attachment.glue_attach]
}

# IAM Role for Glue
resource "aws_iam_role" "glue_service_role" {
  name = "AWSGlueServiceRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "glue.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      }
    ]
  })
}

# IAM Policy for Glue access
resource "aws_iam_policy" "glue_policy" {
  name        = "AWSGlueServicePolicy"
  description = "Policy for Glue crawler to access S3 and Glue"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ],
        Resource = [
          "arn:aws:s3:::${var.bucket_name}",
          "arn:aws:s3:::${var.bucket_name}/*"
        ]
      },
      {
        Effect = "Allow",
        Action = "glue:*",
        Resource = "*"
      }
    ]
  })
}

# Attach policy to role
resource "aws_iam_role_policy_attachment" "glue_attach" {
  role       = aws_iam_role.glue_service_role.name
  policy_arn = aws_iam_policy.glue_policy.arn
}
# ============================================
# 7. IAM Role for Lambda
# ============================================

# Lambda execution role with trust policy
resource "aws_iam_role" "lambda_role" {
  name = "lambda-athena-s3-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      }
    ]
  })
}

# IAM Policy for Lambda - Allow Athena queries, S3 access, and CloudWatch logging
resource "aws_iam_policy" "lambda_policy" {
  name        = "lambda-athena-s3-cloudwatch-policy"
  description = "Policy for Lambda to execute Athena queries, access S3, and write CloudWatch logs"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      # Athena permissions
      {
        Effect = "Allow",
        Action = [
          "athena:StartQueryExecution",
          "athena:GetQueryExecution",
          "athena:GetQueryResults",
          "athena:StopQueryExecution",
          "athena:GetWorkGroup",
          "athena:ListWorkGroups"
        ],
        Resource = "*"
      },
      # S3 permissions for Athena queries and data access
      {
        Effect = "Allow",
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ],
        Resource = [
          "arn:aws:s3:::${var.bucket_name}",
          "arn:aws:s3:::${var.bucket_name}/*"
        ]
      },
      # CloudWatch Logs permissions
      {
        Effect = "Allow",
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource = "arn:aws:logs:${var.region}:*:log-group:/aws/lambda/*"
      },
      # Glue catalog permissions (to query tables)
      {
        Effect = "Allow",
        Action = [
          "glue:GetDatabase",
          "glue:GetTable",
          "glue:GetPartitions",
          "glue:BatchGetPartition"
        ],
        Resource = "*"
      }
    ]
  })
}

# Attach policy to Lambda role
resource "aws_iam_role_policy_attachment" "lambda_policy_attach" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}

# ============================================
# 8. Lambda Function for Athena Queries
# ============================================

# Data source to get the hash of the zip file for change detection
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/lambda.zip"
  output_path = "${path.module}/lambda-output.zip"
}

# Lambda function
resource "aws_lambda_function" "athena_query_student" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "athena-query-student"
  role             = aws_iam_role.lambda_role.arn
  handler          = "index.handler"
  runtime          = "python3.9"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  timeout          = 60
  memory_size      = 256

  environment {
    variables = {
      DATABASE_NAME = aws_glue_catalog_database.student_db.name
      S3_BUCKET     = var.bucket_name
      RESULTS_PATH  = "s3://${var.bucket_name}/athena-results/"
    }
  }

  depends_on = [aws_iam_role_policy_attachment.lambda_policy_attach]
}

# CloudWatch Log Group for Lambda
resource "aws_cloudwatch_log_group" "athena_query_logs" {
  name              = "/aws/lambda/athena-query-student"
  retention_in_days = 14
}

# ============================================
# 9. API Gateway REST API
# ============================================

# REST API
resource "aws_api_gateway_rest_api" "athena_api" {
  name        = "athena-query-api"
  description = "API Gateway for Athena query Lambda function"
}

# Resource for /query endpoint
resource "aws_api_gateway_resource" "query_resource" {
  rest_api_id = aws_api_gateway_rest_api.athena_api.id
  parent_id   = aws_api_gateway_rest_api.athena_api.root_resource_id
  path_part   = "query"
}

# POST method on /query
resource "aws_api_gateway_method" "query_post" {
  rest_api_id      = aws_api_gateway_rest_api.athena_api.id
  resource_id      = aws_api_gateway_resource.query_resource.id
  http_method      = "POST"
  authorization    = "NONE"
}

# Integration with Lambda
resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id             = aws_api_gateway_rest_api.athena_api.id
  resource_id             = aws_api_gateway_resource.query_resource.id
  http_method             = aws_api_gateway_method.query_post.http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = aws_lambda_function.athena_query_student.invoke_arn
}

# Lambda permission to allow API Gateway invocation
resource "aws_lambda_permission" "api_gateway_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.athena_query_student.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.athena_api.execution_arn}/*/*"
}

# API Deployment
resource "aws_api_gateway_deployment" "athena_api_deployment" {
  rest_api_id = aws_api_gateway_rest_api.athena_api.id

  depends_on = [aws_api_gateway_integration.lambda_integration]
}

# API Gateway Stage
resource "aws_api_gateway_stage" "athena_api_stage" {
  deployment_id = aws_api_gateway_deployment.athena_api_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.athena_api.id
  stage_name    = "dev"

  variables = {
    Environment = "dev"
  }
}

# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api_gateway_logs" {
  name              = "/aws/apigateway/athena-query-api"
  retention_in_days = 14
}
