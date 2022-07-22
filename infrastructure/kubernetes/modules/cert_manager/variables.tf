variable "email" {
  description = "Email address to use for cert renovation warnings"
  type        = string
}

variable "cert_server" {
  description = "Lets encrypt server URL"
  type        = string
  default     = "https://acme-v02.api.letsencrypt.org/directory"
}
