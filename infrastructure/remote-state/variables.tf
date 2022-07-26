variable "location" {
  type        = string
  description = "Azure Location in which the resources will be created"
}

variable "project_name" {
  type        = string
  description = "An environment namespace for the infrastructure."
}

variable "resource_group_name" {
  type        = string
  description = "Azure resource group to use for the project."
}

variable "storage_account_name" {
  type        = string
  description = "Azure storage account name to use for the project."
}

variable "project_tags" {
  description = "Project resource tags"
  type        = map(string)
  default     = {}
}
