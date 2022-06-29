variable "location" {
  type        = string
  description = "Azure Location in which the resources will be created"
}

variable "project_name" {
  type        = string
  description = "An environment namespace for the infrastructure."
}

variable "project_resource_group" {
  type        = string
  description = "Azure resource group to use for the project."
}

variable "project_tags" {
  description = "Project resource tags"
  type        = map(string)
}
