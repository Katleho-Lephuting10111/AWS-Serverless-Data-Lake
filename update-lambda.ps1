# Update Lambda function with new zip file
$zipPath = "c:\Users\user\Desktop\PROJECT Y\PROJECTS\AWS Serveless Data Lake\AWS-Serverless-Data-Lake\student-datalake\lambda_new.zip"

# Read zip file as byte array
$zipBytes = [System.IO.File]::ReadAllBytes($zipPath)
$zipBase64 = [Convert]::ToBase64String($zipBytes)

# Update Lambda
$result = aws lambda update-function-code `
  --function-name athena-query-student `
  --zip-file "fileb://$zipBase64"

$result | Out-File -FilePath "c:\Users\user\Desktop\PROJECT Y\PROJECTS\AWS Serveless Data Lake\AWS-Serverless-Data-Lake\lambda-update.log"

Write-Host "Lambda update initiated..."
Write-Host $result

