variable "name" {
  description = "(Required) Specifies the name of the private dns zone"
  type        = string
}

variable "resource_group" {
  description = "The Azure resource group where the module will create its resources"
}

variable "virtual_networks_to_link" {
  description = "(Optional) Specifies the subscription id, resource group name, and name of the virtual networks to which create a virtual network link"
  type        = map(any)
  default     = {}
}
