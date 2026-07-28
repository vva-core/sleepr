############################################
# Bootstrap: remote state backend for Terraform
#
# Run this ONCE (with a local backend) to create the
# S3 bucket + DynamoDB table that the rest of the
# Terraform stacks will use as their remote backend.
############################################

provider "aws" {
  region = var.region
}

variable "region" {
  description = "AWS region for the state backend resources (matches EKS/ECR in eu-north-1)"
  type        = string
  default     = "eu-north-1"
}

variable "state_bucket_name" {
  description = "Globally-unique S3 bucket name for Terraform state"
  type        = string
  default     = "sleepr-tfstate"
}

variable "lock_table_name" {
  description = "DynamoDB table name for Terraform state locking"
  type        = string
  default     = "sleepr-tfstate-locks"
}

# --- S3 bucket for state ---------------------------------------------------

resource "aws_s3_bucket" "tfstate" {
  bucket = var.state_bucket_name

  # Safety: don't let Terraform destroy the state bucket
  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "tfstate" {
  bucket                  = aws_s3_bucket.tfstate.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# --- DynamoDB table for state locking --------------------------------------

resource "aws_dynamodb_table" "tf_locks" {
  name         = var.lock_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}

# --- Outputs ---------------------------------------------------------------

output "state_bucket" {
  value = aws_s3_bucket.tfstate.bucket
}

output "lock_table" {
  value = aws_dynamodb_table.tf_locks.name
}
