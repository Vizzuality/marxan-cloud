terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.13.0"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "2.17.0"
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

    kubectl = {
      source  = "gavinbunney/kubectl"
      version = ">= 1.7.0"
    }

    postgresql = {
      source  = "cyrilgdn/postgresql"
      version = "1.16.0"
    }

    sparkpost = {
      source  = "SurveyMonkey/sparkpost"
      version = "0.2.2"
    }
  }
  required_version = "1.2.4"
}


provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = true
    }
  }
}

provider "sparkpost" {
  api_key  = var.sparkpost_api_key
  base_url = var.sparkpost_base_url
}

provider "helm" {
  kubernetes {
    host                   = "${trim(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.host, "443")}${var.port}"
    client_certificate     = base64decode(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.client_certificate)
    client_key             = base64decode(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.client_key)
    cluster_ca_certificate = base64decode(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.cluster_ca_certificate)
  }
}

provider "kubernetes" {
  host                   = "${trim(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.host, "443")}${var.port}"
  client_certificate     = base64decode(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.client_certificate)
  client_key             = base64decode(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.client_key)
  cluster_ca_certificate = base64decode(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.cluster_ca_certificate)
}

provider "kubectl" {
  host                   = "${trim(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.host, "443")}${var.port}"
  client_certificate     = base64decode(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.client_certificate)
  client_key             = base64decode(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.client_key)
  cluster_ca_certificate = base64decode(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.cluster_ca_certificate)
  load_config_file       = false
}

provider "postgresql" {
  alias = "db_tunnel_production"

  host      = length(module.db_tunnel_production) > 0 ? module.db_tunnel_production[0].host : null
  port      = length(module.db_tunnel_production) > 0 ? module.db_tunnel_production[0].port : null
  username   =lookup(data.terraform_remote_state.core.outputs, "sql_server_production_username", null)
  password   =lookup(data.terraform_remote_state.core.outputs, "sql_server_production_password", null)
  sslmode   = "require"
  superuser = false
}

provider "postgresql" {
  alias = "db_tunnel_staging"

  host      = module.db_tunnel_staging.host
  port      = module.db_tunnel_staging.port
  username  = data.terraform_remote_state.core.outputs.sql_server_staging_username
  password  = data.terraform_remote_state.core.outputs.sql_server_staging_password
  sslmode   = "require"
  superuser = false
}
