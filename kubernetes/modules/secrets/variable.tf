variable "k8s_host" {
  description = "Hostname of the k8s cluster"
  type        = string
}

variable "k8s_client_certificate" {
  description = "Client certificate for the k8s cluster"
  type        = string
}

variable "k8s_client_key" {
  description = "Client key for the k8s cluster"
  type        = string
}

variable "k8s_cluster_ca_certificate" {
  description = "Cluster CA certificate for the k8s cluster"
  type        = string
}

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
