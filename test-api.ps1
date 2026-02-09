# Test API Gateway endpoint
$url = "https://mbx9hm69ye.execute-api.eu-west-1.amazonaws.com/dev/query"
$body = '{"query": "SELECT 1 as test"}'

Invoke-RestMethod -Uri $url -Method Post -ContentType "application/json" -Body $body

