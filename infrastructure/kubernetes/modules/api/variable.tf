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

variable "api_postgres_logging" {
  type        = string
  description = "Value for the API_POSTGRES_LOGGING env var"
}

variable "http_logging_morgan_format" {
  type        = string
  description = "Value for the BACKEND_HTTP_LOGGING_MORGAN_FORMAT env var"
}

variable "temp_data_pvc_name" {
  type        = string
  description = "Name of the PVC to use for backend storage for temporary data"
}

variable "cloning_pvc_name" {
  type        = string
  description = "Name of the PVC to use for backend storage for cloning"
}
