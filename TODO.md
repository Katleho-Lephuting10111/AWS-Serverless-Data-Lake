# TODO: Connect Frontend to Real API Gateway

## Phase 1: AWS Resources Status ✓
- [x] 1.1 Lambda function `athena-query-student` exists
- [x] 1.2 API Gateway `athena-query-api` exists (ID: shhoo6hhtl)
- [x] 1.3 Glue database `student_db` exists
- [x] 1.4 S3 bucket `student-socialmedia-datalake` exists
- [x] 1.5 Bucket policy applied for Athena access

## Phase 2: Frontend Configuration ✓
- [x] 2.1 Created `Frontend/.env.local` with API Gateway URL
- [x] 2.2 API Endpoint: `https://shhoo6hhtl.execute-api.eu-west-1.amazonaws.com/dev/query`
- [x] 2.3 Updated all frontend files with new API endpoint
  - `Frontend/src/hooks/useChartData.ts`
  - `Frontend/src/pages/ApiCharts.tsx`
  - `Frontend/src/pages/QueryExecutor.tsx`
  - `test-api.ps1`

## Phase 3: Lambda Zip File Sync ✓
- [x] 3.1 Created `rebuild-lambda.ps1` - PowerShell script to rebuild and update Lambda
- [x] 3.2 Created `rebuild-lambda.bat` - Batch file for easy execution
- [x] 3.3 Scripts create fresh `lambda.zip` from latest `index.py`
- [x] 3.4 Scripts update Lambda function in AWS automatically

## Phase 4: S3/IAM Permissions ✓
- [x] 4.1 Created `fix-iam-permissions.ps1` - Comprehensive IAM fix script
- [x] 4.2 Created `fix-iam-permissions.bat` - Batch file wrapper
- [x] 4.3 Added missing `s3:GetBucketLocation` permission
- [x] 4.4 Added `s3:DeleteObject` for query result cleanup
- [x] 4.5 Updated Lambda IAM role with full Athena permissions
- [x] 4.6 Updated S3 bucket policy with proper conditions
- [x] 4.7 Verifies Athena WorkGroup configuration

## Phase 5: CORS Configuration ✓
- [x] 5.1 Created `configure-cors.ps1` - CORS configuration script
- [x] 5.2 Created `configure-cors.bat` - Batch file wrapper
- [x] 5.3 Adds OPTIONS method for preflight requests
- [x] 5.4 Configures Access-Control headers
- [x] 5.5 Deploys API to 'dev' stage

## Phase 6: Glue Crawler Setup ✓
- [x] 6.1 Created `setup-glue-crawler.ps1` - Glue crawler management script
- [x] 6.2 Created `setup-glue-crawler.bat` - Batch file wrapper
- [x] 6.3 Checks existing crawler status
- [x] 6.4 Creates crawler if missing
- [x] 6.5 Ensures database exists
- [x] 6.6 Starts and monitors crawler
- [x] 6.7 Lists tables and verifies
- [x] 6.8 Optionally creates sample data

## Phase 7: Testing & Verification
- [ ] 7.1 Run: `fix-iam-permissions.bat` (fix IAM permissions first!)
- [ ] 7.2 Run: `configure-cors.bat` (configure CORS)
- [ ] 7.3 Run: `rebuild-lambda.bat` (update Lambda)
- [ ] 7.4 Run: `setup-glue-crawler.bat` (setup tables)
- [ ] 7.5 Run: `test-api.bat` (test API)
- [ ] 7.6 Start frontend: `cd Frontend && npm run dev`
- [ ] 7.7 Verify charts display live data from Athena

---

## API Gateway URL:
```
https://shhoo6hhtl.execute-api.eu-west-1.amazonaws.com/dev/query
```

## Quick Test Command:
```bash
# Test API Gateway directly
curl -X POST \
  https://shhoo6hhtl.execute-api.eu-west-1.amazonaws.com/dev/query \
  -H 'Content-Type: application/json' \
  -d '{"query": "SELECT 1 as test"}'
```

## Available Scripts (in root directory):
| Script | Purpose |
|--------|---------|
| `fix-iam-permissions.bat` | Fix IAM/S3 permissions (RUN FIRST!) |
| `configure-cors.bat` | Configure CORS for API Gateway |
| `rebuild-lambda.bat` | Rebuild and update Lambda function |
| `setup-glue-crawler.bat` | Setup Glue crawler and create tables |
| `test-api.bat` | Test API Gateway endpoint |
| `test-lambda.bat` | Test Lambda function directly |

## Execution Order:
```
1. fix-iam-permissions.bat  ← Run first!
2. configure-cors.bat
3. rebuild-lambda.bat
4. setup-glue-crawler.bat
5. test-api.bat
```

## Next Steps:
1. Execute scripts in the order above
2. Start frontend: `cd Frontend && npm run dev`
3. Navigate to `/api-charts` to see live data from Athena

