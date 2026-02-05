provider "aws" {
  region = var.region
}

# 1. Create S3 bucket
resource "aws_s3_bucket" "datalake" {
  bucket = var.bucket_name
}

# 1a. Enable ACLs on the bucket
resource "aws_s3_bucket_acl" "datalake_acl" {
  bucket              = aws_s3_bucket.datalake.id
  acl                 = "private"
  depends_on          = [aws_s3_bucket_ownership_controls.datalake]
}

# 1b. Configure bucket ownership controls to enable ACLs
resource "aws_s3_bucket_ownership_controls" "datalake" {
  bucket = aws_s3_bucket.datalake.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

# 2. Enable versioning
resource "aws_s3_bucket_versioning" "versioning" {
  bucket = aws_s3_bucket.datalake.id
  versioning_configuration {
    status = "Enabled"
  }
}

# 3. Lifecycle policy (archive raw data after 30 days)
resource "aws_s3_bucket_lifecycle_configuration" "lifecycle" {
  bucket = aws_s3_bucket.datalake.id

  rule {
    id     = "archive-raw-data"
    status = "Enabled"

    filter {
      prefix = "raw/"
    }

    transition {
      days          = 30
      storage_class = "GLACIER"
    }
  }
}

# 4. Create folder structure (prefixes)
resource "aws_s3_object" "raw_folder" {
  bucket = aws_s3_bucket.datalake.id
  key    = "raw/"
}

resource "aws_s3_object" "processed_folder" {
  bucket = aws_s3_bucket.datalake.id
  key    = "processed/"
}

resource "aws_s3_object" "athena_results_folder" {
  bucket = aws_s3_bucket.datalake.id
  key    = "athena-results/"
}

# 5. Glue Database
resource "aws_glue_catalog_database" "student_db" {
  name = "student_db"
}

# 6. Glue Crawler
resource "aws_glue_crawler" "student_crawler" {
  name          = "student-crawler"
  role          = aws_iam_role.glue_service_role.arn
  database_name = aws_glue_catalog_database.student_db.name

  s3_target {
    path = "s3://${var.bucket_name}/raw/"
  }
  depends_on = [aws_iam_role_policy_attachment.glue_attach]
}

# IAM Role for Glue
resource "aws_iam_role" "glue_service_role" {
  name = "AWSGlueServiceRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "glue.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      }
    ]
  })
}

# IAM Policy for Glue access
resource "aws_iam_policy" "glue_policy" {
  name        = "AWSGlueServicePolicy"
  description = "Policy for Glue crawler to access S3 and Glue"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ],
        Resource = [
          "arn:aws:s3:::${var.bucket_name}",
          "arn:aws:s3:::${var.bucket_name}/*"
        ]
      },
      {
        Effect = "Allow",
        Action = "glue:*",
        Resource = "*"
      }
    ]
  })
}

# Attach policy to role
resource "aws_iam_role_policy_attachment" "glue_attach" {
  role       = aws_iam_role.glue_service_role.name
  policy_arn = aws_iam_policy.glue_policy.arn
}
