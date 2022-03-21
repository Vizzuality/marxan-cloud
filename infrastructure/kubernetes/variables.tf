variable "project_name" {
  type        = string
  description = "The name of the project. Used in naming most of the resources in the infrastructure."
}

variable "location" {
  type        = string
  description = "Azure Location in which the resources will be created"
}

variable "port" {
  type        = number
  default     = 443
  description = "The TCP port to use when reaching the AKS cluster. Useful when using an SSH tunnel"
}

variable "cert_email" {
  type        = string
  description = "Email address to use for cert renovation warnings"
  default     = "cert@marxan.com"
}

variable "domain" {
  type        = string
  description = "The domain name"
}

variable "sparkpost_api_key" {
  type        = string
  description = "The API key for Sparkpost"
}
