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
  name                = data.terraform_remote_state.core.outputs.k8s_cluster_name
  resource_group_name = data.azurerm_resource_group.resource_group.name
}

data "azurerm_dns_zone" "dns_zone" {
  name                = data.terraform_remote_state.core.outputs.dns_zone_name
  resource_group_name = data.azurerm_resource_group.resource_group.name
}

locals {
  k8s_host                   = "${trim(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.host, "443")}${var.port}"
  k8s_client_certificate     = base64decode(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.client_certificate)
  k8s_client_key             = base64decode(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.client_key)
  k8s_cluster_ca_certificate = base64decode(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.cluster_ca_certificate)
  backend_storage_class      = "azurefile-csi-nfs"
  backend_storage_size       = "100Gi"
  backend_storage_pvc_name   = "backend-shared-spatial-data-storage"
}

module "k8s_namespaces" {
  source                     = "./modules/k8s_namespaces"
  namespaces                 = ["production", "staging"]
  k8s_host                   = local.k8s_host
  k8s_client_certificate     = local.k8s_client_certificate
  k8s_client_key             = local.k8s_client_key
  k8s_cluster_ca_certificate = local.k8s_cluster_ca_certificate
}

module "cert_manager" {
  source                     = "./modules/cert_manager"
  k8s_host                   = local.k8s_host
  k8s_client_certificate     = local.k8s_client_certificate
  k8s_client_key             = local.k8s_client_key
  k8s_cluster_ca_certificate = local.k8s_cluster_ca_certificate
  email                      = var.cert_email
}

module "k8s_storage" {
  source                     = "./modules/storage"
  k8s_host                   = local.k8s_host
  k8s_client_certificate     = local.k8s_client_certificate
  k8s_client_key             = local.k8s_client_key
  k8s_cluster_ca_certificate = local.k8s_cluster_ca_certificate
  backend_storage_class      = local.backend_storage_class
}

####
# Production
####
module "key_vault_production" {
  source         = "./modules/key_vault"
  namespace      = "production"
  resource_group = data.azurerm_resource_group.resource_group
  project_name   = var.project_name
}

module "k8s_api_database_production" {
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

module "k8s_geoprocessing_database_production" {
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

module "backend_storage_pvc_production" {
  source                     = "./modules/volumes"
  k8s_host                   = local.k8s_host
  k8s_client_certificate     = local.k8s_client_certificate
  k8s_client_key             = local.k8s_client_key
  k8s_cluster_ca_certificate = local.k8s_cluster_ca_certificate
  namespace                  = "production"
  backend_storage_class      = local.backend_storage_class
  backend_storage_pvc_name   = local.backend_storage_pvc_name
  backend_storage_size       = local.backend_storage_size
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
  application_base_url       = "https://${var.domain}"
  network_cors_origins       = "https://${var.domain}"
  http_logging_morgan_format = ""
  backend_storage_pvc_name   = local.backend_storage_pvc_name
}

module "geoprocessing_production" {
  source                     = "./modules/geoprocessing"
  k8s_host                   = local.k8s_host
  k8s_client_certificate     = local.k8s_client_certificate
  k8s_client_key             = local.k8s_client_key
  k8s_cluster_ca_certificate = local.k8s_cluster_ca_certificate
  namespace                  = "production"
  image                      = "marxan.azurecr.io/marxan-geoprocessing:production"
  deployment_name            = "geoprocessing"
  backend_storage_pvc_name   = local.backend_storage_pvc_name
}

module "client_production" {
  source                     = "./modules/client"
  k8s_host                   = local.k8s_host
  k8s_client_certificate     = local.k8s_client_certificate
  k8s_client_key             = local.k8s_client_key
  k8s_cluster_ca_certificate = local.k8s_cluster_ca_certificate
  namespace                  = "production"
  image                      = "marxan.azurecr.io/marxan-client:production"
  deployment_name            = "client"
  site_url                   = "https://${data.terraform_remote_state.core.outputs.dns_zone_name}"
  api_url                    = "https://api.${data.terraform_remote_state.core.outputs.dns_zone_name}"
}

module "webshot_production" {
  source                     = "./modules/webshot"
  k8s_host                   = local.k8s_host
  k8s_client_certificate     = local.k8s_client_certificate
  k8s_client_key             = local.k8s_client_key
  k8s_cluster_ca_certificate = local.k8s_cluster_ca_certificate
  namespace                  = "production"
  image                      = "marxan.azurecr.io/marxan-webshot:production"
  deployment_name            = "webshot"
}

module "production_secrets" {
  source                     = "./modules/secrets"
  k8s_host                   = local.k8s_host
  k8s_client_certificate     = local.k8s_client_certificate
  k8s_client_key             = local.k8s_client_key
  k8s_cluster_ca_certificate = local.k8s_cluster_ca_certificate
  project_name               = var.project_name
  namespace                  = "production"
  name                       = "api"
  key_vault_id               = module.key_vault_production.key_vault_id
  redis_host                 = data.terraform_remote_state.core.outputs.redis_hostname
  redis_password             = data.terraform_remote_state.core.outputs.redis_password
  redis_port                 = data.terraform_remote_state.core.outputs.redis_port
  sparkpost_api_key          = var.sparkpost_api_key
  api_url                    = "api.${var.domain}"
}

module "ingress_production" {
  source                     = "./modules/ingress"
  namespace                  = "production"
  k8s_host                   = local.k8s_host
  k8s_client_certificate     = local.k8s_client_certificate
  k8s_client_key             = local.k8s_client_key
  k8s_cluster_ca_certificate = local.k8s_cluster_ca_certificate
  resource_group             = data.azurerm_resource_group.resource_group
  project_name               = var.project_name
  dns_zone                   = data.azurerm_dns_zone.dns_zone
  domain                     = var.domain
}


####
# Staging
####
module "key_vault_staging" {
  source         = "./modules/key_vault"
  namespace      = "staging"
  resource_group = data.azurerm_resource_group.resource_group
  project_name   = var.project_name
}

module "k8s_api_database_staging" {
  source                     = "./modules/database"
  k8s_host                   = local.k8s_host
  k8s_client_certificate     = local.k8s_client_certificate
  k8s_client_key             = local.k8s_client_key
  k8s_cluster_ca_certificate = local.k8s_cluster_ca_certificate
  resource_group             = data.azurerm_resource_group.resource_group
  project_name               = var.project_name
  namespace                  = "staging"
  name                       = "api"
  key_vault_id               = module.key_vault_staging.key_vault_id
}

module "k8s_geoprocessing_database_staging" {
  source                     = "./modules/database"
  k8s_host                   = local.k8s_host
  k8s_client_certificate     = local.k8s_client_certificate
  k8s_client_key             = local.k8s_client_key
  k8s_cluster_ca_certificate = local.k8s_cluster_ca_certificate
  resource_group             = data.azurerm_resource_group.resource_group
  project_name               = var.project_name
  namespace                  = "staging"
  name                       = "geoprocessing"
  key_vault_id               = module.key_vault_staging.key_vault_id
}

module "backend_storage_pvc_staging" {
  source                     = "./modules/volumes"
  k8s_host                   = local.k8s_host
  k8s_client_certificate     = local.k8s_client_certificate
  k8s_client_key             = local.k8s_client_key
  k8s_cluster_ca_certificate = local.k8s_cluster_ca_certificate
  namespace                  = "staging"
  backend_storage_class      = local.backend_storage_class
  backend_storage_pvc_name   = local.backend_storage_pvc_name
  backend_storage_size       = local.backend_storage_size
}

module "api_staging" {
  source                     = "./modules/api"
  k8s_host                   = local.k8s_host
  k8s_client_certificate     = local.k8s_client_certificate
  k8s_client_key             = local.k8s_client_key
  k8s_cluster_ca_certificate = local.k8s_cluster_ca_certificate
  namespace                  = "staging"
  image                      = "marxan.azurecr.io/marxan-api:staging"
  deployment_name            = "api"
  application_base_url       = "https://staging.${var.domain}"
  network_cors_origins       = "https://staging.${var.domain}"
  http_logging_morgan_format = "short"
  backend_storage_pvc_name   = local.backend_storage_pvc_name
}

module "geoprocessing_staging" {
  source                     = "./modules/geoprocessing"
  k8s_host                   = local.k8s_host
  k8s_client_certificate     = local.k8s_client_certificate
  k8s_client_key             = local.k8s_client_key
  k8s_cluster_ca_certificate = local.k8s_cluster_ca_certificate
  namespace                  = "staging"
  image                      = "marxan.azurecr.io/marxan-geoprocessing:staging"
  deployment_name            = "geoprocessing"
  cleanup_temporary_folders  = "false"
  backend_storage_pvc_name   = local.backend_storage_pvc_name
}

module "client_staging" {
  source                     = "./modules/client"
  k8s_host                   = local.k8s_host
  k8s_client_certificate     = local.k8s_client_certificate
  k8s_client_key             = local.k8s_client_key
  k8s_cluster_ca_certificate = local.k8s_cluster_ca_certificate
  namespace                  = "staging"
  image                      = "marxan.azurecr.io/marxan-client:staging"
  deployment_name            = "client"
  site_url                   = "https://staging.${data.terraform_remote_state.core.outputs.dns_zone_name}"
  api_url                    = "https://api.staging.${data.terraform_remote_state.core.outputs.dns_zone_name}"
}

module "webshot_staging" {
  source                     = "./modules/webshot"
  k8s_host                   = local.k8s_host
  k8s_client_certificate     = local.k8s_client_certificate
  k8s_client_key             = local.k8s_client_key
  k8s_cluster_ca_certificate = local.k8s_cluster_ca_certificate
  namespace                  = "staging"
  image                      = "marxan.azurecr.io/marxan-webshot:staging"
  deployment_name            = "webshot"
}

module "staging_secrets" {
  source                     = "./modules/secrets"
  k8s_host                   = local.k8s_host
  k8s_client_certificate     = local.k8s_client_certificate
  k8s_client_key             = local.k8s_client_key
  k8s_cluster_ca_certificate = local.k8s_cluster_ca_certificate
  project_name               = var.project_name
  namespace                  = "staging"
  name                       = "api"
  key_vault_id               = module.key_vault_staging.key_vault_id
  redis_host                 = data.terraform_remote_state.core.outputs.redis_hostname
  redis_password             = data.terraform_remote_state.core.outputs.redis_password
  redis_port                 = data.terraform_remote_state.core.outputs.redis_port
  sparkpost_api_key          = var.sparkpost_api_key
  api_url                    = "api.staging.${var.domain}"
}

module "ingress_staging" {
  source                     = "./modules/ingress"
  namespace                  = "staging"
  k8s_host                   = local.k8s_host
  k8s_client_certificate     = local.k8s_client_certificate
  k8s_client_key             = local.k8s_client_key
  k8s_cluster_ca_certificate = local.k8s_cluster_ca_certificate
  resource_group             = data.azurerm_resource_group.resource_group
  project_name               = var.project_name
  dns_zone                   = data.azurerm_dns_zone.dns_zone
  domain                     = var.domain
  domain_prefix              = "staging"
}
