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

variable "key_vault_access_users" {
  type = list(string)
  description = "The names of the users to grant access to the secrets"
  default = []
}

variable "deploy_production" {
  type        = bool
  description = "If the production deployment should be created"
}

variable "production_db_instance_size" {
  type        = string
  description = "Azure SQL instance type for the production database"
}

variable "production_db_storage_size" {
  type        = number
  description = "Azure SQL instance storage size for the production database"
}

variable "staging_db_instance_size" {
  type        = string
  description = "Azure SQL instance type for the staging database"
}

variable "staging_db_storage_size" {
  type        = number
  description = "Azure SQL instance storage size for the staging database"
}
