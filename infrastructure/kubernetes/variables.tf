variable "project_name" {
  type        = string
  description = "The name of the project. Used in naming most of the resources in the infrastructure."
}

variable "resource_group_name" {
  type        = string
  description = "Azure resource group to use for the project."
}

variable "storage_account_name" {
  type        = string
  description = "Azure service account to use for the project."
}

variable "port" {
  type        = number
  default     = 443
  description = "The TCP port to use when reaching the AKS cluster. Useful when using an SSH tunnel"
}

variable "cert_email" {
  type        = string
  description = "Email address to use for cert renovation warnings"
}

variable "domain" {
  type        = string
  description = "The domain name"
}

variable "email_domain" {
  type        = string
  description = "The domain name from which to send emails"
}

variable "support_email" {
  type        = string
  description = "Email address to which users can send support requests"
}

variable "sparkpost_api_key" {
  type        = string
  description = "Sparkpost API key"
}

variable "sparkpost_base_url" {
  type        = string
  description = "Sparkpost API base url"
  default     = "https://api.sparkpost.com"
}

variable "temp_data_storage_size" {
  type        = string
  description = "Size of the backend storage claim for temporary data"
}

variable "cloning_storage_size" {
  type        = string
  description = "Size of the backend storage claim for project cloning"
}

variable "key_vault_access_users" {
  type        = list(string)
  description = "The names of the users to grant access to the secrets"
  default     = [] # if this is not here, terraform apply will fail. Why?
}

variable "project_tags" {
  description = "Project resource tags"
  type        = map(string)
  default     = {}
}

variable "deploy_production" {
  type        = bool
  description = "If the production deployment should be created"
}

variable "deploy_staging" {
  type        = bool
  description = "If the staging deployment should be created. Not fully implemented"
  default     = true
}

variable "alert_email_addresses" {
  description = "Key-value pair of name of email receiver and their email address. Used for sending ping test alert emails"
}
