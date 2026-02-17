# Upload Data to Your AWS Data Lake

## What This Does

This uploads sample student wellness data to your S3 bucket so your Frontend app can display real charts and analytics.

## Quick Start

**Option 1: Run the batch file (easiest)**
```cmd
upload-data.bat
```

**Option 2: Run PowerShell script directly**
```powershell
.\upload-data.ps1
```

## What Gets Uploaded

**File**: `sample-data/student-social-media-usage.csv`
- **54 rows** of student wellness data
- **Columns**: student_id, platform, daily_usage_hours, sleep_hours, conflicts, mental_health_score, academic_impact_score, day_of_week, timestamp
- **Platforms**: Instagram, TikTok, YouTube, Twitter, Facebook, LinkedIn, Reddit
- **Data range**: Covers a full week (Monday-Sunday)

## What Happens

1. **Uploads CSV to S3**: `s3://student-socialmedia-datalake/raw/student-social-media-usage.csv`
2. **Starts Glue Crawler**: Scans the file and creates table schema
3. **Creates Athena Table**: `student_social_media_usage` in `student_db` database

## After Upload

**Wait 1-3 minutes for crawler to finish**, then:

### Test in AWS Console (Athena)
1. Go to: https://console.aws.amazon.com/athena/home?region=eu-west-1
2. Select database: `student_db`
3. Run query:
```sql
SELECT * FROM student_social_media_usage LIMIT 10;
```

### Test Your Frontend App
1. Start the app: `cd Frontend && npm run dev`
2. Go to **Charts** page
3. You should see real data from S3!

### Test the API Endpoint
```powershell
.\test-api.ps1
```

## Troubleshooting

### Error: "AWS CLI not installed"
Install AWS CLI: https://aws.amazon.com/cli/

### Error: "Failed to upload to S3"
**Fix**: Configure AWS credentials
```bash
aws configure
```
Enter:
- AWS Access Key ID
- AWS Secret Access Key
- Region: `eu-west-1`
- Output format: `json`

### Error: "Access Denied"
**Fix**: Check IAM permissions
```powershell
.\fix-iam-permissions.ps1
```

### Crawler doesn't start
**Manually start in AWS Console**:
1. Go to: https://console.aws.amazon.com/glue/home?region=eu-west-1#/v2/data-catalog/crawlers
2. Select `student-crawler`
3. Click **Run crawler**

### Check Crawler Status
```bash
aws glue get-crawler --name student-crawler --region eu-west-1 --query 'Crawler.State'
```

**States**:
- `READY` - Finished successfully
- `RUNNING` - Still scanning
- `STOPPING` - Wait...

## Adding Your Own Data

Want to add more data? Just upload more CSV files to the raw/ folder:

```bash
aws s3 cp your-data.csv s3://student-socialmedia-datalake/raw/ --region eu-west-1
```

Then run the crawler again:
```bash
aws glue start-crawler --name student-crawler --region eu-west-1
```

## Data Schema

Your CSV must have these columns:

| Column | Type | Description |
|--------|------|-------------|
| student_id | string | Unique student ID (e.g., S001) |
| platform | string | Social media platform name |
| daily_usage_hours | decimal | Hours spent per day |
| sleep_hours | decimal | Hours of sleep |
| conflicts | int | Number of social media conflicts |
| mental_health_score | decimal | Score 0-10 |
| academic_impact_score | decimal | Score 0-10 |
| day_of_week | string | Monday, Tuesday, etc. |
| timestamp | string | ISO 8601 format (e.g., 2024-02-10T08:00:00Z) |

## Next Steps

Once data is uploaded and crawler finishes:

1. ✅ Charts page will show real data
2. ✅ API queries will return actual results
3. ✅ Athena can query your entire dataset
4. 🔄 Dashboard still uses localStorage (for user personal data)

To make Dashboard also use S3, you'd need to create a Lambda function to write user data to S3 (not just read).
