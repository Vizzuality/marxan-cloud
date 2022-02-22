terraform {
  backend "azurerm" {
    resource_group_name  = "marxan"        // var.project_name
    storage_account_name = "marxan"        // var.project_name
    container_name       = "marxantfstate" // ${var.project_name}tfstate
    key                  = "kubernetes.tfstate"
  }
}

data "azurerm_resource_group" "resource_group" {
  name = var.project_name
}

data "azurerm_subscription" "subscription" {
}

data "terraform_remote_state" "core" {
  backend = "azurerm"
  config = {
    resource_group_name  = "marxan"        // var.project_name
    storage_account_name = "marxan"        // var.project_name
    container_name       = "marxantfstate" // ${var.project_name}tfstate
    key                  = "infrastructure.tfstate"
  }
}

data "azurerm_kubernetes_cluster" "k8s_cluster" {
  name                = data.terraform_remote_state.core.outputs.aks_cluster_name
  resource_group_name = data.azurerm_resource_group.resource_group.name
}

locals {
  k8s_host                   = "${trim(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.host, "443")}${var.port}"
  k8s_client_certificate     = base64decode(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.client_certificate)
  k8s_client_key             = base64decode(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.client_key)
  k8s_cluster_ca_certificate = base64decode(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.cluster_ca_certificate)
}

module "k8s_namespaces" {
  source                     = "./modules/k8s_namespaces"
  namespaces                 = ["production", "staging"]
  k8s_host                   = local.k8s_host
  k8s_client_certificate     = local.k8s_client_certificate
  k8s_client_key             = local.k8s_client_key
  k8s_cluster_ca_certificate = local.k8s_cluster_ca_certificate
}

module "key_vault_production" {
  source         = "./modules/key_vault"
  namespace      = "production"
  resource_group = data.azurerm_resource_group.resource_group
  project_name   = var.project_name
}

module "k8s_api_database" {
  source                     = "./modules/database"
  k8s_host                   = local.k8s_host
  k8s_client_certificate     = local.k8s_client_certificate
  k8s_client_key             = local.k8s_client_key
  k8s_cluster_ca_certificate = local.k8s_cluster_ca_certificate
  resource_group             = data.azurerm_resource_group.resource_group
  project_name               = var.project_name
  namespace                  = "production"
  name                       = "api"
  key_vault_id               = module.key_vault_production.key_vault_id
}

module "k8s_geoprocessing_database" {
  source                     = "./modules/database"
  k8s_host                   = local.k8s_host
  k8s_client_certificate     = local.k8s_client_certificate
  k8s_client_key             = local.k8s_client_key
  k8s_cluster_ca_certificate = local.k8s_cluster_ca_certificate
  resource_group             = data.azurerm_resource_group.resource_group
  project_name               = var.project_name
  namespace                  = "production"
  name                       = "geoprocessing"
  key_vault_id               = module.key_vault_production.key_vault_id
}

module "api_production" {
  source                     = "./modules/api"
  k8s_host                   = local.k8s_host
  k8s_client_certificate     = local.k8s_client_certificate
  k8s_client_key             = local.k8s_client_key
  k8s_cluster_ca_certificate = local.k8s_cluster_ca_certificate
  namespace                  = "production"
  image                      = "marxan.azurecr.io/marxan-api:production"
  deployment_name            = "api"
}

module "api_production_secret" {
  source                     = "./modules/secrets"
  k8s_host                   = local.k8s_host
  k8s_client_certificate     = local.k8s_client_certificate
  k8s_client_key             = local.k8s_client_key
  k8s_cluster_ca_certificate = local.k8s_cluster_ca_certificate
  project_name               = var.project_name
  namespace                  = "production"
  name                       = "api"
  key_vault_id               = module.key_vault_production.key_vault_id
  redis_host                 = data.terraform_remote_state.core.outputs.redis_url
  redis_password             = data.terraform_remote_state.core.outputs.redis_password
}
