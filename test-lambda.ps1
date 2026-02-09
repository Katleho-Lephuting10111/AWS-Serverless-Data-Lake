# Test Lambda function
$payload = @{query = "SELECT 1 as test"}
$payloadJson = $payload | ConvertTo-Json

Write-Host "Invoking Lambda..."
$result = aws lambda invoke `
    --function-name athena-query-student `
    --payload $payloadJson `
    response.json

if ($LASTEXITCODE -eq 0) {
    Write-Host "Lambda invoked successfully!"
    Get-Content response.json
} else {
    Write-Host "Lambda invocation failed: $result"
}
