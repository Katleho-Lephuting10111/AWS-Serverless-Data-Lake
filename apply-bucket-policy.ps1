# Apply S3 bucket policy for Athena
$policy = @{
    Version = "2012-10-17"
    Statement = @(
        @{
            Sid = "AllowAthenaQueryOutput"
            Effect = "Allow"
            Principal = @{ Service = "athena.amazonaws.com" }
            Action = @("s3:GetObject", "s3:PutObject", "s3:ListBucket")
            Resource = @("arn:aws:s3:::student-socialmedia-datalake", "arn:aws:s3:::student-socialmedia-datalake/*")
        }
    )
}

$policyJson = $policy | ConvertTo-Json -Depth 5
Write-Host "Policy JSON:"
Write-Host $policyJson

$result = aws s3api put-bucket-policy --bucket student-socialmedia-datalake --policy $policyJson
Write-Host "Result:"
Write-Host $result

