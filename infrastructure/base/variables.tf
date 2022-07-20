variable "project_name" {
  type        = string
  description = "The name of the project. Used in naming most of the resources in the infrastructure."
}

variable "project_resource_group" {
  type        = string
  description = "Azure resource group to use for the project."
}

variable "container_registry_name" {
  type        = string
  description = "Name for the Azure CR. Must be globally unique"
}

variable "location" {
  type        = string
  description = "Azure Location in which the resources will be created"
}

variable "bastion_ssh_public_keys" {
  type        = list(any)
  description = "Public SSH keys to add to the bastion host"
}

variable "domain" {
  type        = string
  description = "The domain name without the 'www.' prefix."
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


variable "vpn_cidrs" {
  type        = list(string)
  description = "Comma separated list of VPN CIDRs"
}

variable "sparkpost_dns_cname_name" {
  type        = string
  description = "The name of the DNS CNAME record for Sparkpost"
  default     = "mail"
}

variable "sparkpost_dns_cname_value" {
  type        = string
  description = "value of the DNS CNAME record for Sparkpost"
  default     = "sparkpostmail.com"
}

variable "sparkpost_dns_dkim_name" {
  type        = string
  description = "The name of the DNS TXT record for Sparkpost DKIM"
}

variable "sparkpost_dns_dkim_value" {
  type        = string
  description = "The value of the DNS TXT record for Sparkpost DKIM"
}

variable "project_tags" {
  description = "Project resource tags"
  type        = map(string)
}

variable "redis_instance_name" {
  description = " Globally unique Redis instance name"
  type        = string
}
