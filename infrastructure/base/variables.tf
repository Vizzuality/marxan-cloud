variable "project_name" {
  type        = string
  description = "The name of the project. Used in naming most of the resources in the infrastructure."
}

variable "location" {
  type        = string
  description = "Azure Location in which the resources will be created"
}

variable "bastion_ssh_public_key" {
  type        = string
  description = "Public SSH key to add to the bastion host"
}

variable "domain" {
  type        = string
  description = "The domain name"
}
