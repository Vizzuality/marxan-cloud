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

variable "temp_data_storage_class" {
  description = "Storage class for shared temporary storage"
  type        = string
}

variable "temp_data_storage_size" {
  type        = string
  description = "Size of the PVC to use for shared temporary storage"
}

variable "temp_data_pvc_name" {
  type        = string
  description = "Name of the PVC to use for shared temporary storage"
}

variable "cloning_storage_class" {
  description = "Storage class for shared project cloning storage"
  type        = string
}

variable "cloning_storage_size" {
  type        = string
  description = "Size of the PVC to use for shared project cloning storage"
}

variable "cloning_pvc_name" {
  type        = string
  description = "Name of the PVC to use for shared project cloning storage"
}
