variable "project_name" {
  type        = string
  description = "A project name to use when naming resources."
}

variable "resource_group" {
  description = "The Azure resource group where the module will create its resources"
}

variable "aks_cluster_id" {
  type        = string
  description = "The Azure AKS cluster id"
}

variable "name" {
  type        = string
  description = "The node pool name"
}

variable "vm_size" {
  type        = string
  default     = "Standard_D2_v2"
  description = "The node pool machine type"
}

variable "min_node_count" {
  type        = number
  default     = 1
  description = "The minimum number of machines in this pool"
}

variable "max_node_count" {
  type        = number
  default     = 12
  description = "The maximum number of machines in this pool"
}

variable "node_labels" {
  type        = map(any)
  default     = {}
  description = "A map of Kubernetes labels which should be applied to nodes in this Node Pool"
}

variable "subnet_id" {
  type = string
}

variable "orchestrator_version" {
  type = string
}
