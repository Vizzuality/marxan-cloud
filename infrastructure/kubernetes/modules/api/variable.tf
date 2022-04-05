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


variable "image" {
  type        = string
  description = "The dockerhub image reference to deploy"
}

variable "deployment_name" {
  type        = string
  description = "The k8s deployment name"
}

variable "namespace" {
  type        = string
  description = "The k8s namespace to use"
}

variable "application_base_url" {
  type        = string
  description = "Value for the APPLICATION_BASE_URL env var"
}

variable "network_cors_origins" {
  type        = string
  description = "Value for the NETWORK_CORS_ORIGINS env var"
}

variable "http_logging_morgan_format" {
  type        = string
  description = "Value for the BACKEND_HTTP_LOGGING_MORGAN_FORMAT env var"
}
