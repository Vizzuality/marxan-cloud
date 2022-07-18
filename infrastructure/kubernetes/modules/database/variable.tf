variable "name" {
  type        = string
  description = "A database server name to use when naming resources."
}

variable "project_name" {
  type        = string
  description = "A project name to use when naming resources."
}

variable "resource_group" {
  description = "The Azure resource group where the module will create its resources"
}

variable "namespace" {
  description = "The k8s namespace in which to deploy resources"
}

variable "key_vault_id" {
  description = "Azure key vault id"
}

variable "sql_server_name" {
  type = string
}
