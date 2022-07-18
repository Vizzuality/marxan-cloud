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


variable "geo_postgres_logging" {
  type        = string
  description = "Value for the GEO_POSTGRES_LOGGING env var"
}

variable "cleanup_temporary_folders" {
  type        = bool
  default     = true
  description = "Whether to cleanup temporary folders (should only be false temporarily and for diagnostic purposes)"
}

variable "temp_data_pvc_name" {
  type        = string
  description = "Name of the PVC to use for backend storage for temporary data"
}

variable "cloning_pvc_name" {
  type        = string
  description = "Name of the PVC to use for backend storage for cloning"
}
