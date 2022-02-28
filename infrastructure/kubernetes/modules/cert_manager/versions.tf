terraform {
  required_providers {
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.4.1"
    }

    kubectl = {
      source  = "gavinbunney/kubectl"
      version = ">= 1.7.0"
    }
  }
  required_version = "1.1.3"
}

provider "helm" {
  kubernetes {
    host                   = var.k8s_host
    client_certificate     = var.k8s_client_certificate
    client_key             = var.k8s_client_key
    cluster_ca_certificate = var.k8s_cluster_ca_certificate
  }
}


provider "kubectl" {
  host                   = var.k8s_host
  client_certificate     = var.k8s_client_certificate
  client_key             = var.k8s_client_key
  cluster_ca_certificate = var.k8s_cluster_ca_certificate
  load_config_file       = false
}
