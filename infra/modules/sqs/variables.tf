variable "environment" {
  description = "Environment name (e.g., dev, stage, prod)"
  type        = string
}

variable "eks_oidc_provider_arn" {
  description = "ARN of the EKS OIDC provider"
  type        = string
}

variable "eks_oidc_provider" {
  description = "URL of the EKS OIDC provider without the protocol (e.g., oidc.eks.region.amazonaws.com/id/XXXXXX)"
  type        = string
}

variable "sns_topic_arn" {
  description = "ARN of the SNS topic for CloudWatch alarms"
  type        = string
} 