variable "name" {
  description = "The name of the secret"
}

variable "namespace" {
  description = "The k8s namespace in which to deploy resources"
}

variable "key_vault_id" {
  description = "Azure key vault id"
}

variable "project_name" {
  type        = string
  description = "A project name to use when naming resources."
}

variable "redis_host" {
  description = "The redis server hostname"
}

variable "redis_password" {
  description = "The redis server password"
}

variable "redis_port" {
  description = "The redis server port"
}

variable "sparkpost_api_key" {
  type        = string
  description = "The API key for Sparkpost"
}

variable "api_url" {
  type        = string
  description = "The URL for the Marxan API server"
}

variable "postgres_geoprocessing_hostname" {
  description = "The postgres geoprocessing database hostname"
}

variable "postgres_geoprocessing_username" {
  description = "The postgres geoprocessing database username"
}

variable "postgres_geoprocessing_password" {
  description = "The postgres geoprocessing database password"
}

variable "postgres_geoprocessing_database" {
  description = "The postgres geoprocessing database name"
}

variable "postgres_api_hostname" {
  description = "The postgres api database hostname"
}

variable "postgres_api_username" {
  description = "The postgres api database username"
}

variable "postgres_api_password" {
  description = "The postgres api database password"
}

variable "postgres_api_database" {
  description = "The postgres api database name"
}

variable "postgres_14_geoprocessing_hostname" {
  description = "The postgres geoprocessing database hostname"
}

variable "postgres_14_geoprocessing_username" {
  description = "The postgres geoprocessing database username"
}

variable "postgres_14_geoprocessing_password" {
  description = "The postgres geoprocessing database password"
}

variable "postgres_14_geoprocessing_database" {
  description = "The postgres geoprocessing database name"
}

variable "postgres_14_api_hostname" {
  description = "The postgres api database hostname"
}

variable "postgres_14_api_username" {
  description = "The postgres api database username"
}

variable "postgres_14_api_password" {
  description = "The postgres api database password"
}

variable "postgres_14_api_database" {
  description = "The postgres api database name"
}

variable "azure_storage_account_key" {
  description = "A key for the Azure storage account used for backups"
}
