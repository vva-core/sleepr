output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets — used by EKS nodes and ALB"
  value       = module.vpc.public_subnets
}
