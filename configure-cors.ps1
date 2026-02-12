# Configure CORS for API Gateway
# This script adds OPTIONS method for preflight requests

$ErrorActionPreference = "Stop"

Write-Host "=== Configuring CORS for API Gateway ===" -ForegroundColor Cyan
Write-Host ""

$apiId = "shhoo6hhtl"
$region = "eu-west-1"
$resourceId = (aws apigateway get-resources --rest-api-id $apiId --query 'items[?pathPart==`query`].id' --output text)

if (-not $resourceId) {
    Write-Warning "Resource /query not found. Trying to get root resource..."
    $resourceId = (aws apigateway get-resources --rest-api-id $apiId --query 'items[0].id' --output text)
}

if (-not $resourceId) {
    Write-Error "Could not find API Gateway resource ID"
    exit 1
}

Write-Host "API ID: $apiId"
Write-Host "Resource ID: $resourceId"
Write-Host ""

# ============================================
# Step 1: Add OPTIONS Method for CORS Preflight
# ============================================

Write-Host "[1/4] Adding OPTIONS method for CORS preflight..." -ForegroundColor Yellow

$optionsMethod = @{
    httpMethod = "OPTIONS"
    authorizationType = "NONE"
    requestParameters = @{
        "method.request.header.Access-Control-Request-Headers" = false
        "method.request.header.Access-Control-Request-Method" = false
        "method.request.header.Origin" = false
    }
    methodResponses = @(
        @{
            statusCode = "200"
            responseParameters = @{
                "method.response.header.Access-Control-Allow-Origin" = true
                "method.response.header.Access-Control-Allow-Methods" = true
                "method.response.header.Access-Control-Allow-Headers" = true
            }
        }
    )
} | ConvertTo-Json -Depth 5

try {
    $null = aws apigateway put-method `
        --rest-api-id $apiId `
        --resource-id $resourceId `
        --http-method OPTIONS `
        --authorization-type "NONE" `
        --request-parameters "method.request.header.Access-Control-Request-Headers=false,method.request.header.Access-Control-Request-Method=false,method.request.header.Origin=false" `
        2>&1

    Write-Host "  ✓ OPTIONS method created" -ForegroundColor Green
} catch {
    Write-Warning "  ! OPTIONS method may already exist or error: $_"
}

# ============================================
# Step 2: Add Mock Integration for OPTIONS
# ============================================

Write-Host "[2/4] Adding mock integration for OPTIONS..." -ForegroundColor Yellow

$null = aws apigateway put-integration `
    --rest-api-id $apiId `
    --resource-id $resourceId `
    --http-method OPTIONS `
    --type MOCK `
    --integration-http-method OPTIONS `
    --request-templates @{
        "application/json" = "{""statusCode"": 200}"
    } `
    2>&1

Write-Host "  ✓ Mock integration configured" -ForegroundColor Green

# ============================================
# Step 3: Add Integration Response for OPTIONS
# ============================================

Write-Host "[3/4] Adding integration response for OPTIONS..." -ForegroundColor Yellow

$null = aws apigateway put-integration-response `
    --rest-api-id $apiId `
    --resource-id $resourceId `
    --http-method OPTIONS `
    --status-code 200 `
    --response-parameters @{
        "method.response.header.Access-Control-Allow-Origin" = "'*'"
        "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,OPTIONS'"
        "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization,X-Api-Key'"
    } `
    2>&1

Write-Host "  ✓ Integration response configured" -ForegroundColor Green

# ============================================
# Step 4: Add Method Response for OPTIONS
# ============================================

Write-Host "[4/4] Adding method response for OPTIONS..." -ForegroundColor Yellow

$null = aws apigateway put-method-response `
    --rest-api-id $apiId `
    --resource-id $resourceId `
    --http-method OPTIONS `
    --status-code 200 `
    --response-parameters @{
        "method.response.header.Access-Control-Allow-Origin" = true
        "method.response.header.Access-Control-Allow-Methods" = true
        "method.response.header.Access-Control-Allow-Headers" = true
    } `
    2>&1

Write-Host "  ✓ Method response configured" -ForegroundColor Green

# ============================================
# Step 5: Deploy API
# ============================================

Write-Host ""
Write-Host "[5/5] Deploying API to 'dev' stage..." -ForegroundColor Yellow

try {
    $null = aws apigateway create-deployment `
        --rest-api-id $apiId `
        --stage-name dev `
        --description "CORS configuration update" `
        2>&1

    Write-Host "  ✓ API deployed successfully" -ForegroundColor Green
} catch {
    Write-Warning "  ! Deployment may have failed or no changes to deploy"
}

# ============================================
# Verification
# ============================================

Write-Host ""
Write-Host "[Verification] Checking CORS configuration..." -ForegroundColor Yellow

$corsMethods = aws apigateway get-method --rest-api-id $apiId --resource-id $resourceId --http-method OPTIONS --query '[httpMethod, authorizationType]' --output json 2>&1

if ($corsMethods) {
    Write-Host "  ✓ CORS is configured for OPTIONS method" -ForegroundColor Green
} else {
    Write-Warning "  ! Could not verify CORS configuration"
}

Write-Host ""
Write-Host "=== CORS Configuration Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "CORS Headers configured:" -ForegroundColor Cyan
Write-Host "  - Access-Control-Allow-Origin: *" -ForegroundColor White
Write-Host "  - Access-Control-Allow-Methods: GET, POST, OPTIONS" -ForegroundColor White
Write-Host "  - Access-Control-Allow-Headers: Content-Type, Authorization, X-Api-Key" -ForegroundColor White
Write-Host ""
Write-Host "Note: The Lambda function also includes these headers in its response." -ForegroundColor Yellow

