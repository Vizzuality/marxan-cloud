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

variable "email" {
  description = "Email address to use for cert renovation warnings"
  type        = string
}

variable "cert_server" {
  description = "Lets encrypt server URL"
  type        = string
  default     = "https://acme-v02.api.letsencrypt.org/directory"
}
