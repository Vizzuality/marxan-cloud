variable "project_name" {
  type        = string
  description = "A project name to use when naming resources."
}

variable "resource_group" {
  description = "The Azure resource group where the module will create its resources"
}

variable "namespace" {
  description = "The k8s namespace in which to deploy resources"
}

variable "dns_zone" {
  description = "The Azure DNS zone where the bastion A record will be added"
}

variable "domain" {
  type        = string
  description = "The base domain"
}

variable "domain_prefix" {
  type        = string
  default     = null
  description = "The prefix added to the base domain"
}

variable "project_tags" {
  description = "Project resource tags"
  type        = map(string)
}
