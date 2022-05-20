variable "dns_zone" {
  description = "The Azure DNS zone where the bastion A record will be added"
}

variable "resource_group" {
  description = "The Azure resource group where the module will create its resources"
}

variable "cname_name" {
  type        = string
  description = "The name of the DNS CNAME record for Sparkpost"
  default = "mail"
}

variable "cname_value" {
  type        = string
  description = "value of the DNS CNAME record for Sparkpost"
  default = "sparkpostmail.com"
}

variable "dkim_name" {
  type        = string
  description = "The name of the DNS TXT record for Sparkpost DKIM"
}

variable "dkim_value" {
  type        = string
  description = "The value of the DNS TXT record for Sparkpost DKIM"
}
