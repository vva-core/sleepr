# Terraform Bootstrap

Creates the S3 bucket and DynamoDB table used as the remote backend
for all other Terraform stacks.

## ⚠️ Run ONCE only

This stack has already been applied. The following resources exist in AWS:

| Resource                    | Name                   |
| --------------------------- | ---------------------- |
| S3 bucket (state storage)   | `sleepr-tfstate`       |
| DynamoDB table (state lock) | `sleepr-tfstate-locks` |
| Region                      | `eu-north-1`           |

**Do NOT run `terraform apply` again** — it will fail because the S3 bucket already exists.

## If you need to re-adopt these resources (e.g. lost local state)

```bash
cd terraform/bootstrap
terraform init
terraform import aws_s3_bucket.tfstate sleepr-tfstate
terraform import aws_s3_bucket_versioning.tfstate sleepr-tfstate
terraform import aws_s3_bucket_server_side_encryption_configuration.tfstate sleepr-tfstate
terraform import aws_s3_bucket_public_access_block.tfstate sleepr-tfstate
terraform import aws_dynamodb_table.tf_locks sleepr-tfstate-locks
terraform plan  # should show 0 changes
```
