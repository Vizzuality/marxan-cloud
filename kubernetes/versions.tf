terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "2.92.0"
    }

    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.8.0"
    }

    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.4.1"
    }

    template = {
      source = "hashicorp/template"
    }
  }
  required_version = "1.1.3"
}


provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = true
    }
  }
}

provider "helm" {
  kubernetes {
    host                   = data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.host
    client_certificate     = base64decode(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.client_certificate)
    client_key             = base64decode(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.client_key)
    cluster_ca_certificate = base64decode(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.cluster_ca_certificate)
  }
}

provider "kubernetes" {
  host                   = data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.host
  client_certificate     = base64decode(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.client_certificate)
  client_key             = base64decode(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.client_key)
  cluster_ca_certificate = base64decode(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.cluster_ca_certificate)
}
