variable "region" {
  description = "AWS region for the development environment"
  type        = string
  default     = "eu-north-1"
}

variable "environment" {
  description = "Environment name (dev, prod)"
  type        = string
  default     = "dev"
}

provider "aws" {
  region = var.region
}

module "network" {
  source      = "../../modules/network"
  environment = var.environment
}

# # Configured after the EKS cluster is created — reads cluster credentials from AWS
# provider "kubernetes" {
#   host                   = module.eks.cluster_endpoint
#   cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)

#   exec {
#     api_version = "client.authentication.k8s.io/v1beta1"
#     command     = "aws"
#     args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
#   }
# }

# # Helm uses the same EKS credentials as the kubernetes provider
# provider "helm" {
#   kubernetes {
#     host                   = module.eks.cluster_endpoint
#     cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
#     exec {
#       api_version = "client.authentication.k8s.io/v1beta1"
#       command     = "aws"
#       args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
#     }
#   }
# }

# # random provider needs no configuration
# provider "random" {}
