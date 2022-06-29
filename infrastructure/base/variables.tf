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
  type        = list
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

variable "vpn_cidrs" {
  type        = list(string)
  description = "Comma separated list of CIDRs for the TNC VPN"
}

variable "sparkpost_dns_cname_name" {
  type        = string
  description = "The name of the DNS CNAME record for Sparkpost"
  default = "mail"
}

variable "sparkpost_dns_cname_value" {
  type        = string
  description = "value of the DNS CNAME record for Sparkpost"
  default = "sparkpostmail.com"
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
