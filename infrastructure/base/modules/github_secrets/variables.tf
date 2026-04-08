variable "repo_name" {
  type = string
}

variable "aks_cluster_name" {
  type = string
}

variable "aks_host" {
  type = string
}

variable "client_id" {
  type = string
}

variable "resource_group_name" {
  type = string
}

variable "subscription_id" {
  type = string
}

variable "tenant_id" {
  type = string
}

variable "bastion_host" {
  type = string
}

variable "bastion_ssh_private_key" {
  type = string
}

variable "bastion_user" {
  type = string
}

variable "registry_login_server" {
  type = string
}

# TODO: remove once the ACR token login is approved and integrated
variable "registry_password" {
  type = string
}

# TODO: remove once the ACR token login is approved and integrated
variable "registry_username" {
  type = string
}

variable "mapbox_api_token" {
  type = string
}

variable "domain" {
  type        = string
  description = "Domain where the app is publicly available"
}

variable "support_email" {
  type = string
  description = "Email address to which users can send support requests"
}

# ──────────────────────────────────────────────────────────────────────────────
# ACR token-based authentication
# ──────────────────────────────────────────────────────────────────────────────

variable "registry_name" {
  type = string
}

variable "registry_token_username" {
  type = string
}

variable "registry_token_password" {
  type      = string
  sensitive = true
}
