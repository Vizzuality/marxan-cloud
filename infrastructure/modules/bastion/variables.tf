variable "project_name" {
  type        = string
  description = "A project name to use when naming resources."
}

variable "resource_group" {
  description = "The Azure resource group where the module will create its resources"
}

variable "bastion_ssh_public_keys" {
  type        = list(any)
  description = "Public SSH keys to add to the bastion host"
}

variable "bastion_host_size" {
  description = "VM type for the bastion host"
  default     = "Standard_B1ls"
}

variable "bastion_subnet_id" {
  description = "The id of the subnet where the bastion host will be placed"
}
