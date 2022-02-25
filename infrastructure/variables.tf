variable "project_name" {
  type        = string
  description = "An environment namespace for the infrastructure."
}

variable "location" {
  type        = string
  description = "Azure Location in which the resources will be created"
}

variable "bastion_ssh_public_keys" {
  type        = list(any)
  description = "Public SSH keys to add to the bastion host"
}

variable "log_analytics_workspace_name" {
  description = "Specifies the name of the log analytics workspace"
  default     = "MarxanAksWorkspace"
  type        = string
}

variable "log_analytics_retention_days" {
  description = "Specifies the number of days of the retention policy"
  type        = number
  default     = 30
}

variable "solution_plan_map" {
  description = "Specifies solutions to deploy to log analytics workspace"
  default = {
    ContainerInsights = {
      product   = "OMSGallery/ContainerInsights"
      publisher = "Microsoft"
    }
  }
  type = map(any)
}

variable "domain" {
  type = string
  description = "The domain name"
}
