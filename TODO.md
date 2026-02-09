# TODO: Connect Frontend to Real API Gateway

## Phase 1: AWS Resources Status ✓
- [x] 1.1 Lambda function `athena-query-student` exists
- [x] 1.2 API Gateway `athena-query-api` exists (ID: mbx9hm69ye)
- [x] 1.3 Glue database `student_db` exists
- [x] 1.4 S3 bucket `student-socialmedia-datalake` exists
- [x] 1.5 Bucket policy applied for Athena access

## Phase 2: Frontend Configuration ✓
- [x] 2.1 Created `Frontend/.env.local` with API Gateway URL
- [x] 2.2 API Endpoint: `https://mbx9hm69ye.execute-api.eu-west-1.amazonaws.com/dev/query`

## Phase 3: Pending Fixes (Lambda/S3 Permission Issue)
**Issue Found:** Lambda invocation fails with "Unable to verify/create output bucket"
- [ ] 3.1 Fix Lambda IAM role - need athena:* permissions on the bucket for query results
- [ ] 3.2 Run Glue crawler to ensure tables exist
- [ ] 3.3 Test API Gateway endpoint

## Phase 4: Testing & Verification
- [ ] 4.1 Start frontend dev server: `cd Frontend && npm run dev`
- [ ] 4.2 Test API connection
- [ ] 4.3 Verify charts display live data from Athena

---

## API Gateway URL (Already Configured in .env.local):
```
https://mbx9hm69ye.execute-api.eu-west-1.amazonaws.com/dev/query
```

## Quick Test Command:
```bash
# Test API Gateway directly
curl -X POST \
  https://mbx9hm69ye.execute-api.eu-west-1.amazonaws.com/dev/query \
  -H 'Content-Type: application/json' \
  -d '{"query": "SELECT 1 as test"}'
```

## Next Steps:
1. Run Glue crawler to populate tables: `aws glue start-crawler --name student-crawler`
2. Once tables exist, the API will return actual data
3. Start frontend and navigate to `/api-charts` to see live data

