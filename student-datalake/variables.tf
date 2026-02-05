variable "region" {
  type    = string
  default = "eu-west-1"
  description = "AWS region for deployment"
}

variable "bucket_name" {
  type    = string
  default = "student-socialmedia-datalake"
  description = "Name of the S3 bucket for the data lake"
}
