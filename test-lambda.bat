@echo off
REM Test Lambda Function
aws lambda invoke --function-name athena-query-student --payload "{\"query\": \"SELECT 1 as test\"}" response.json
type response.json
pause

