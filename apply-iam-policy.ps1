# Create S3 policy for Lambda role
$policy = @{
    Version = "2012-10-17"
    Statement = @(
        @{
            Effect = "Allow"
            Action = @("s3:PutObject", "s3:GetObject", "s3:ListBucket")
            Resource = @("arn:aws:s3:::student-socialmedia-datalake", "arn:aws:s3:::student-socialmedia-datalake/*")
        }
    )
}

$policyJson = $policy | ConvertTo-Json -Depth 5
Write-Host "Applying S3 policy to Lambda role..."
$result = aws iam put-role-policy --role-name lambda-athena-s3-role --policy-name S3AthenaAccess --policy-document $policyJson
if ($LASTEXITCODE -eq 0) {
    Write-Host "Policy applied successfully!"
} else {
    Write-Host "Failed to apply policy: $result"
}
