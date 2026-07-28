terraform {
  backend "s3" {
    bucket         = "sleepr-tfstate"
    key            = "envs/dev/terraform.tfstate"
    region         = "eu-north-1"
    dynamodb_table = "sleepr-tfstate-locks"
    encrypt        = true
  }
}
