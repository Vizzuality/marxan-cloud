variable "project_name" {
  type        = string
  description = "The name of the project. Used in naming most of the resources in the infrastructure."
}

variable "container_registry_name" {
  type        = string
  description = "Name for the Azure CR. Must be globally unique"
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

variable "github_org" {
  type        = string
  description = "Name of the Github org where the project is hosted"
}

variable "github_repo" {
  type        = string
  description = "Name of the Github project where the source code is hosted"
}

variable "github_staging_branch" {
  type        = string
  description = "Name of the Github branch for the staging deployment code"
}

variable "github_production_branch" {
  type        = string
  description = "Name of the Github branch for the staging deployment code"
}
