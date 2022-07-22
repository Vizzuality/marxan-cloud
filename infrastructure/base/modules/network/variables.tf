variable "project_name" {
  type        = string
  description = "A project name to use when naming resources."
}

variable "resource_group" {
  description = "The Azure resource group where the module will create its resources"
}

variable "vpn_cidrs" {
  type        = list(string)
  description = "Comma separated list of CIDRs for the TNC VPN"
}

variable "project_tags" {
  description = "Project resource tags"
  type        = map(string)
}
