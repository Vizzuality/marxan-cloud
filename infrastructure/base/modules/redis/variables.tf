variable "project_name" {
  type        = string
  description = "A project name to use when naming resources."
}

variable "resource_group" {
  description = "The Azure resource group where the module will create its resources"
}

variable "redis_version" {
  type        = string
  default     = "6"
  description = "The Redis major version to use"
}

variable "redis_cache_family" {
  type        = string
  default     = "C"
  description = "The SKU family/pricing group to use"
}

variable "redis_cache_capacity" {
  type        = number
  default     = "1"
  description = "The size of the Redis cache to deploy"
}

variable "redis_cache_sku_name" {
  type        = string
  default     = "Standard"
  description = "The SKU of Redis to use"
}

variable "subnet_id" {
  type        = string
  description = "The id of the subnet where the Redis cache operates"
}

variable "private_connection_resource_id" {
  type = string
}
