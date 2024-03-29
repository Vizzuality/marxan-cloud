terraform {
  backend "azurerm" {
    resource_group_name  = "marxan-rg"     // var.resource_group_name
    storage_account_name = "marxansa"      // var.storage_account_name
    container_name       = "marxan-tnctfstate" // ${var.project_name}tfstate
    key                  = "infrastructure.tfstate"
  }
}

data "azurerm_resource_group" "resource_group" {
  name = var.resource_group_name
}

data "azurerm_subscription" "subscription" {}

data "github_ip_ranges" "latest" {}

locals {
  vpn_cidrs = length(var.vpn_cidrs) > 0 ? concat(var.vpn_cidrs, data.github_ip_ranges.latest.actions_ipv4) : []
}

module "network" {
  source         = "./modules/network"
  resource_group = data.azurerm_resource_group.resource_group
  project_name   = var.project_name
  vpn_cidrs      = local.vpn_cidrs
  project_tags   = var.project_tags
}

module "dns" {
  source         = "./modules/dns"
  resource_group = data.azurerm_resource_group.resource_group
  domain         = var.domain
}

module "bastion" {
  source                  = "./modules/bastion"
  resource_group          = data.azurerm_resource_group.resource_group
  project_name            = var.project_name
  bastion_ssh_public_keys = var.bastion_ssh_public_keys
  bastion_subnet_id       = module.network.bastion_subnet_id
  dns_zone                = module.dns.dns_zone
}

module "container_registry" {
  source                   = "./modules/container-registry"
  resource_group           = data.azurerm_resource_group.resource_group
  container_registry_name  = var.project_name
  github_org               = var.github_org
  github_repo              = var.github_repo
  github_production_branch = var.github_production_branch
  github_staging_branch    = var.github_staging_branch
}

module "kubernetes" {
  source                   = "./modules/kubernetes"
  resource_group           = data.azurerm_resource_group.resource_group
  project_name             = var.project_name
  aks_subnet_id            = module.network.aks_subnet_id
  kubernetes_version       = var.kubernetes_version
  virtual_networks_to_link = {
    (module.network.core_vnet_name) = module.network.core_vnet_id
    (module.network.aks_vnet_name)  = module.network.aks_vnet_id
  }
  acr_id = module.container_registry.azurerm_container_registry_id

  aks_vnet_id   = module.network.aks_vnet_id
  aks_vnet_name = module.network.aks_vnet_name

  gateway_subnet_id = module.network.app_gateway_subnet_id
}

module "data_node_pool" {
  source               = "./modules/node_pool"
  name                 = "data"
  aks_cluster_id       = module.kubernetes.cluster_id
  resource_group       = data.azurerm_resource_group.resource_group
  project_name         = var.project_name
  subnet_id            = module.network.aks_subnet_id
  orchestrator_version = var.kubernetes_version
  node_labels          = {
    type : "data"
  }
}

module "app_node_pool" {
  source               = "./modules/node_pool"
  name                 = "app"
  aks_cluster_id       = module.kubernetes.cluster_id
  resource_group       = data.azurerm_resource_group.resource_group
  project_name         = var.project_name
  subnet_id            = module.network.aks_subnet_id
  vm_size              = "Standard_F4s_v2"
  orchestrator_version = var.kubernetes_version
  node_labels          = {
    type : "app"
  }
}

module "github_secrets" {
  source                  = "./modules/github_secrets"
  aks_cluster_name        = module.kubernetes.cluster_name
  aks_host                = module.kubernetes.cluster_private_fqdn
  bastion_host            = module.bastion.bastion_hostname
  bastion_ssh_private_key = module.bastion.bastion_private_key
  bastion_user            = module.bastion.bastion_user
  client_id               = module.container_registry.azure_client_id
  registry_login_server   = module.container_registry.azurerm_container_registry_login_server
  registry_password       = module.container_registry.azuread_application_password
  registry_username       = module.container_registry.azure_client_id
  repo_name               = var.github_repo
  resource_group_name     = data.azurerm_resource_group.resource_group.name
  subscription_id         = data.azurerm_subscription.subscription.subscription_id
  tenant_id               = data.azurerm_subscription.subscription.tenant_id
  mapbox_api_token        = var.mapbox_api_token
  domain                  = var.domain
  support_email           = var.support_email
}

module "log_analytics_workspace" {
  source              = "./modules/log_analytics"
  name                = var.project_name
  location            = data.azurerm_resource_group.resource_group.location
  resource_group_name = data.azurerm_resource_group.resource_group.name
  project_tags        = var.project_tags
}

module "firewall" {
  source                       = "./modules/firewall"
  name                         = "${var.project_name}Firewall"
  resource_group_name          = data.azurerm_resource_group.resource_group.name
  zones                        = ["1", "2", "3"]
  threat_intel_mode            = "Alert"
  location                     = data.azurerm_resource_group.resource_group.location
  sku_tier                     = "Standard"
  pip_name                     = "${var.project_name}PublicIp"
  subnet_id                    = module.network.firewall_subnet_id
  log_analytics_workspace_id   = module.log_analytics_workspace.id
  log_analytics_retention_days = 30
  project_tags                 = var.project_tags
}

module "routetable" {
  source               = "./modules/route_table"
  resource_group_name  = data.azurerm_resource_group.resource_group.name
  location             = data.azurerm_resource_group.resource_group.location
  route_table_name     = "${var.project_name}RouteTable"
  route_name           = "${var.project_name}RouteToAzureFirewall"
  firewall_private_ip  = module.firewall.private_ip_address
  subnets_to_associate = {
    (module.network.aks_subnet_name) = {
      subscription_id      = data.azurerm_subscription.subscription.subscription_id
      resource_group_name  = data.azurerm_resource_group.resource_group.name
      virtual_network_name = module.network.aks_vnet_name
    }
  }
  project_tags = var.project_tags
}

module "redis_private_dns_zone" {
  source                   = "./modules/private_dns_zone"
  name                     = "redis.cache.windows.net"
  resource_group           = data.azurerm_resource_group.resource_group
  virtual_networks_to_link = {
    (module.network.core_vnet_name) = {
      subscription_id     = data.azurerm_subscription.subscription.subscription_id
      resource_group_name = data.azurerm_resource_group.resource_group.name
    }
    (module.network.aks_vnet_name) = {
      subscription_id     = data.azurerm_subscription.subscription.subscription_id
      resource_group_name = data.azurerm_resource_group.resource_group.name
    }
  }
}

module "redis" {
  source                         = "./modules/redis"
  resource_group                 = data.azurerm_resource_group.resource_group
  project_name                   = var.project_name
  subnet_id                      = module.network.aks_subnet_id
  private_connection_resource_id = module.kubernetes.cluster_id
  project_tags                   = var.project_tags
}

module "redis_private_endpoint" {
  source                         = "./modules/private_endpoint"
  name                           = "${var.project_name}RedisPrivateEndpoint"
  location                       = data.azurerm_resource_group.resource_group.location
  resource_group_name            = data.azurerm_resource_group.resource_group.name
  subnet_id                      = module.network.aks_subnet_id
  private_connection_resource_id = module.redis.id
  is_manual_connection           = false
  subresource_name               = "redisCache"
  private_dns_zone_group_name    = "RedisPrivateDnsZoneGroup"
  private_dns_zone_group_ids     = [module.redis_private_dns_zone.dns_zone_id]
  project_tags                   = var.project_tags
}

module "mail_host_dns_records" {
  source         = "./modules/mail"
  resource_group = data.azurerm_resource_group.resource_group
  dns_zone       = module.dns.dns_zone

  cname_name  = var.sparkpost_dns_cname_name
  cname_value = var.sparkpost_dns_cname_value

  dkim_name  = var.sparkpost_dns_dkim_name
  dkim_value = var.sparkpost_dns_dkim_value

  project_tags = var.project_tags
}


### Database
module "sql_server_key_vault" {
  source                 = "./modules/key_vault"
  resource_group         = data.azurerm_resource_group.resource_group
  project_name           = var.project_name
  key_vault_access_users = var.key_vault_access_users
}

module "sql_server_production_tulip" {
  count = var.deploy_production ? 1 : 0

  source              = "./modules/database"
  resource_group      = data.azurerm_resource_group.resource_group
  project_name        = "${var.project_name}-production-tulip"
  subnet_id           = module.network.sql_subnet_id
  private_dns_zone_id = module.sql_server_private_dns_zone.dns_zone_id
  key_vault_id        = module.sql_server_key_vault.key_vault_id
  instance_size       = var.production_db_instance_size
  storage_size        = var.production_db_storage_size
  postgresql_version  = "14"
}

module "sql_server_staging_14" {
  source              = "./modules/database"
  resource_group      = data.azurerm_resource_group.resource_group
  project_name        = "${var.project_name}-staging-14"
  subnet_id           = module.network.sql_subnet_id
  private_dns_zone_id = module.sql_server_private_dns_zone.dns_zone_id
  key_vault_id        = module.sql_server_key_vault.key_vault_id
  instance_size       = var.staging_db_instance_size
  storage_size        = var.staging_db_storage_size
  postgresql_version  = "14"
}

module "sql_server_private_dns_zone" {
  source                   = "./modules/private_dns_zone"
  name                     = "${var.project_name}.postgres.database.azure.com"
  resource_group           = data.azurerm_resource_group.resource_group
  virtual_networks_to_link = {
    (module.network.core_vnet_name) = {
      subscription_id     = data.azurerm_subscription.subscription.subscription_id
      resource_group_name = data.azurerm_resource_group.resource_group.name
    }
    (module.network.aks_vnet_name) = {
      subscription_id     = data.azurerm_subscription.subscription.subscription_id
      resource_group_name = data.azurerm_resource_group.resource_group.name
    }
  }
}

module "backup_storage_production" {
  count = var.deploy_production ? 1 : 0

  source                                 = "./modules/storage"
  cloning_storage_backup_container       = "${var.project_name}-cloning-storage-backup-production"
  cloning_storage_backup_storage_account = var.storage_account_name
}

module "backup_storage_staging" {
  source                                 = "./modules/storage"
  cloning_storage_backup_container       = "${var.project_name}-cloning-storage-backup-staging"
  cloning_storage_backup_storage_account = var.storage_account_name
}
