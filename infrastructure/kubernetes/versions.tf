terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.32.0"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "2.30.0"
    }

    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.16.0"
    }

    helm = {
      source  = "hashicorp/helm"
      version = "2.7.1"
    }

    template = {
      source = "hashicorp/template"
    }

    kubectl = {
      source  = "gavinbunney/kubectl"
      version = "1.14.0"
    }

    postgresql = {
      source  = "cyrilgdn/postgresql"
      version = "1.18.0"
    }

    sparkpost = {
      source  = "SurveyMonkey/sparkpost"
      version = "0.2.2"
    }
  }
  required_version = "1.4.5"
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
  alias = "db_tunnel_production_tulip"

  host      = length(module.db_tunnel_production_tulip) > 0 ? module.db_tunnel_production_tulip[0].host : null
  port      = length(module.db_tunnel_production_tulip) > 0 ? module.db_tunnel_production_tulip[0].port : null
  username  = lookup(data.terraform_remote_state.core.outputs, "sql_server_production_tulip_username", null)
  password  = lookup(data.terraform_remote_state.core.outputs, "sql_server_production_tulip_password", null)
  sslmode   = "require"
  superuser = false
}

provider "postgresql" {
  alias = "db_tunnel_staging_14"

  host      = module.db_tunnel_staging_14.host
  port      = module.db_tunnel_staging_14.port
  username  = data.terraform_remote_state.core.outputs.sql_server_staging_14_username
  password  = data.terraform_remote_state.core.outputs.sql_server_staging_14_password
  sslmode   = "require"
  superuser = false
}
