# ============================================
# Terraform Outputs for DigiHealth Data Lake
# ============================================

# S3 Bucket
output "bucket_name" {
  description = "Name of the S3 bucket for the data lake"
  value       = aws_s3_bucket.datalake.bucket
}

output "bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.datalake.arn
}

# Glue Database
output "glue_database_name" {
  description = "Name of the Glue database"
  value       = aws_glue_catalog_database.student_db.name
}

# Lambda Function
output "lambda_function_name" {
  description = "Name of the Athena query Lambda function"
  value       = aws_lambda_function.athena_query_student.function_name
}

output "lambda_function_arn" {
  description = "ARN of the Athena query Lambda function"
  value       = aws_lambda_function.athena_query_student.arn
}

output "lambda_invoke_arn" {
  description = "Invoke ARN for the Lambda function"
  value       = aws_lambda_function.athena_query_student.invoke_arn
}

# API Gateway
output "api_id" {
  description = "API Gateway ID"
  value       = aws_api_gateway_rest_api.athena_api.id
}

output "api_name" {
  description = "API Gateway name"
  value       = aws_api_gateway_rest_api.athena_api.name
}

output "api_gateway_base_url" {
  description = "Base URL for the API Gateway"
  value       = aws_api_gateway_stage.athena_api_stage.invoke_url
}

output "api_gateway_endpoint" {
  description = "Full URL for the /query endpoint - USE THIS IN FRONTEND"
  value       = "${aws_api_gateway_stage.athena_api_stage.invoke_url}/query"
}

output "api_gateway_arn" {
  description = "ARN of the API Gateway"
  value       = aws_api_gateway_rest_api.athena_api.arn
}

output "api_execution_arn" {
  description = "API Gateway execution ARN"
  value       = aws_api_gateway_rest_api.athena_api.execution_arn
}

# CloudWatch Log Groups
output "lambda_log_group_name" {
  description = "Name of the Lambda CloudWatch log group"
  value       = aws_cloudwatch_log_group.athena_query_logs.name
}

output "api_gateway_log_group_name" {
  description = "Name of the API Gateway CloudWatch log group"
  value       = aws_cloudwatch_log_group.api_gateway_logs.name
}

# Example Usage
output "example_api_call" {
  description = "Example curl command to test the API"
  value = <<EXAMPLE

# Test the API with a sample query:
curl -X POST \\
  "${aws_api_gateway_stage.athena_api_stage.invoke_url}/query" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "SELECT 1 as test"}'

# Frontend configuration:
# VITE_API_BASE_URL=${aws_api_gateway_stage.athena_api_stage.invoke_url}
# VITE_API_ENDPOINT=${aws_api_gateway_stage.athena_api_stage.invoke_url}/query
EXAMPLE
}

