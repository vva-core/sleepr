module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = var.vpc_name
  cidr = var.vpc_cidr

  azs            = var.azs
  public_subnets = var.public_subnet_cidrs

  # Dev: no private subnets, no NAT gateway — free tier friendly
  enable_nat_gateway = false
  enable_vpn_gateway = false

  tags = {
    Terraform   = "true"
    Environment = var.environment
    Project     = "sleepr"
  }
}
