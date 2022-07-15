terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.13.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.8.0"
    }
    postgresql = {
      source  = "cyrilgdn/postgresql"
      version = "1.16.0"
    }
  }
  required_version = "1.2.4"
}

provider "kubernetes" {
  host                   = var.k8s_host
  client_certificate     = var.k8s_client_certificate
  client_key             = var.k8s_client_key
  cluster_ca_certificate = var.k8s_cluster_ca_certificate
}

