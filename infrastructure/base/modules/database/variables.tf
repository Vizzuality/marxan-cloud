variable "project_name" {
  type        = string
  description = "A project name to use when naming resources."
}

variable "resource_group" {
  description = "The Azure resource group where the module will create its resources"
}

variable "postgresql_version" {
  description = "Version of PostgreSQL to use"
  default = "13"
}

variable "subnet_id" {
  type = string
}

variable "private_dns_zone_id" {}

variable "key_vault_id" {
  description = "Azure key vault id"
}

variable "instance_size" {
  description = "Azure SQL instance size to use on the database server"
  type = string
}

variable "storage_size" {
  description = "Azure SQL storage size to use on the database server (in mb)"
  type = number
}
