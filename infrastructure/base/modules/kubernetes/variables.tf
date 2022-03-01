variable "project_name" {
  type        = string
  description = "A project name to use when naming resources."
}

variable "resource_group" {
  description = "The Azure resource group where the module will create its resources"
}

variable "kubernetes_version" {
  type        = string
  description = "Version of kubernetes to deploy"
  default     = "1.22.6"
}

variable "gateway_subnet_id" {
  type = string
}

variable "aks_vnet_id" {
  type = string
}

variable "aks_vnet_name" {
  type = string
}

variable "aks_subnet_id" {
  description = "(Optional) The ID of a Subnet where the Kubernetes Node Pool should exist. Changing this forces a new resource to be created."
  type        = string
}

variable "virtual_networks_to_link" {
  description = "(Optional) Specifies the subscription id, resource group name, and name of the virtual networks to which create a virtual network link"
  type        = map(any)
  default     = {}
}

variable "acr_id" {
  description = "Id of the ACR so pull images from"
  type        = string
}

variable "min_node_count" {
  type        = number
  default     = 1
  description = "The minimum number of machines in the default node pool"
}

variable "max_node_count" {
  type        = number
  default     = 4
  description = "The maximum number of machines in the default node pool"
}

variable "enable_auto_scaling" {
  type        = bool
  default     = true
  description = "If the default node pool will auto-scale"
}
