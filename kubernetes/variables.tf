variable "project_name" {
  type        = string
  description = "An environment namespace for the infrastructure."
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
