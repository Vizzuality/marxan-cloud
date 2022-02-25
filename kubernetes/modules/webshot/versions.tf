terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.8.0"
    }
  }
  required_version = "1.1.3"
}

provider "kubernetes" {
  host                   = var.k8s_host
  client_certificate     = var.k8s_client_certificate
  client_key             = var.k8s_client_key
  cluster_ca_certificate = var.k8s_cluster_ca_certificate
}
