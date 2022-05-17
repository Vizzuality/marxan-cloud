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
