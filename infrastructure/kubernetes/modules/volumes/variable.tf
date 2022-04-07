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

variable "namespace" {
  description = "The k8s namespace in which to deploy resources"
}

variable "backend_storage_class" {
  description = "Storage class for backend storage"
  type        = string
}

variable "backend_storage_size" {
  type        = string
  description = "Size of the PVC to use for backend storage"
}

variable "backend_storage_pvc_name" {
  type        = string
  description = "Name of the PVC to use for backend storage"
}
