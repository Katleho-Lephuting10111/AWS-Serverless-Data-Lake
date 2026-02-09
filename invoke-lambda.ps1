# Invoke Lambda directly
$payload = '{"query": "SELECT 1 as test"}'
$result = aws lambda invoke --function-name athena-query-student --payload $payload C:\tmp\lambda-response.json
Write-Host "Lambda invocation result: $result"
Get-Content C:\tmp\lambda-response.json
