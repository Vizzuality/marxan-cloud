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

variable "key_vault_access_users" {
  type        = list(string)
  description = "The names of the users to grant access to the secrets"
}

variable "key_vault_name_prefix" {
  type        = string
  description = "The prefix to use for the key vault names. KV names must be globally unique."
}

variable "project_tags" {
  description = "Project resource tags"
  type        = map(string)
}
