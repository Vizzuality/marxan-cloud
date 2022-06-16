terraform {
  backend "azurerm" {
    resource_group_name  = "marxan-rg"     // var.project_resource_group
    storage_account_name = "marxansa"      // ${var.project_name}sa
    container_name       = "marxantfstate" // ${var.project_name}tfstate
    key                  = "infrastructure.tfstate"
  }
}

data "azurerm_resource_group" "resource_group" {
  name = var.project_resource_group
}

data "azurerm_subscription" "subscription" {}

data "github_ip_ranges" "latest" {}

module "network" {
  source         = "./modules/network"
  resource_group = data.azurerm_resource_group.resource_group
  project_name   = var.project_name
  vpn_cidrs      = concat(var.vpn_cidrs, data.github_ip_ranges.latest.actions_ipv4)
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
  bastion_ssh_public_keys = [var.bastion_ssh_public_key]
  bastion_subnet_id       = module.network.bastion_subnet_id
  dns_zone                = module.dns.dns_zone
}

module "container_registry" {
  source                   = "./modules/container-registry"
  resource_group           = data.azurerm_resource_group.resource_group
  container_registry_name  = var.container_registry_name
  github_org               = var.github_org
  github_repo              = var.github_repo
  github_production_branch = var.github_production_branch
  github_staging_branch    = var.github_staging_branch
}

module "kubernetes" {
  source         = "./modules/kubernetes"
  resource_group = data.azurerm_resource_group.resource_group
  project_name   = var.project_name
  aks_subnet_id  = module.network.aks_subnet_id
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
  source         = "./modules/node_pool"
  name           = "data"
  aks_cluster_id = module.kubernetes.cluster_id
  resource_group = data.azurerm_resource_group.resource_group
  project_name   = var.project_name
  subnet_id      = module.network.aks_subnet_id
  node_labels = {
    type : "data"
  }
}

module "app_node_pool" {
  source         = "./modules/node_pool"
  name           = "app"
  aks_cluster_id = module.kubernetes.cluster_id
  resource_group = data.azurerm_resource_group.resource_group
  project_name   = var.project_name
  subnet_id      = module.network.aks_subnet_id
  vm_size        = "Standard_F4s_v2"
  node_labels = {
    type : "app"
  }
}

module "redis" {
  source                         = "./modules/redis"
  resource_group                 = data.azurerm_resource_group.resource_group
  project_name                   = var.project_name
  subnet_id                      = module.network.aks_subnet_id
  private_connection_resource_id = module.kubernetes.cluster_id
  project_tags                   = merge(var.project_tags, { Environment = "PRD-STG" })
}

module "log_analytics_workspace" {
  source              = "./modules/log_analytics"
  name                = var.project_name
  location            = var.location
  resource_group_name = data.azurerm_resource_group.resource_group.name
  project_tags        = merge(var.project_tags, { Environment = "PRD-STG" })
}

module "firewall" {
  source                       = "./modules/firewall"
  name                         = "${var.project_name}Firewall"
  resource_group_name          = data.azurerm_resource_group.resource_group.name
  zones                        = ["1", "2", "3"]
  threat_intel_mode            = "Alert"
  location                     = var.location
  sku_tier                     = "Standard"
  pip_name                     = "${var.project_name}PublicIp"
  subnet_id                    = module.network.firewall_subnet_id
  log_analytics_workspace_id   = module.log_analytics_workspace.id
  log_analytics_retention_days = 30
  project_tags                 = merge(var.project_tags, { Environment = "PRD-STG" })
}

module "routetable" {
  source              = "./modules/route_table"
  resource_group_name = data.azurerm_resource_group.resource_group.name
  location            = var.location
  route_table_name    = "${var.project_name}RouteTable"
  route_name          = "${var.project_name}RouteToAzureFirewall"
  firewall_private_ip = module.firewall.private_ip_address
  subnets_to_associate = {
    (module.network.aks_subnet_name) = {
      subscription_id      = data.azurerm_subscription.subscription.subscription_id
      resource_group_name  = data.azurerm_resource_group.resource_group.name
      virtual_network_name = module.network.aks_vnet_name
    }
  }
  project_tags = merge(var.project_tags, { Environment = "PRD-STG" })
}

module "redis_private_dns_zone" {
  source         = "./modules/private_dns_zone"
  name           = "redis.cache.windows.net"
  resource_group = data.azurerm_resource_group.resource_group
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

module "redis_private_endpoint" {
  source                         = "./modules/private_endpoint"
  name                           = "${var.project_name}RedisPrivateEndpoint"
  location                       = var.location
  resource_group_name            = data.azurerm_resource_group.resource_group.name
  subnet_id                      = module.network.aks_subnet_id
  private_connection_resource_id = module.redis.id
  is_manual_connection           = false
  subresource_name               = "redisCache"
  private_dns_zone_group_name    = "RedisPrivateDnsZoneGroup"
  private_dns_zone_group_ids     = [module.redis_private_dns_zone.id]
  project_tags                   = merge(var.project_tags, { Environment = "PRD-STG" })
}

module "mail_host_dns_records" {
  source         = "./modules/mail"
  resource_group = data.azurerm_resource_group.resource_group
  dns_zone       = module.dns.dns_zone

  cname_name  = var.sparkpost_dns_cname_name
  cname_value = var.sparkpost_dns_cname_value

  dkim_name  = var.sparkpost_dns_dkim_name
  dkim_value = var.sparkpost_dns_dkim_value

  project_tags = merge(var.project_tags, { Environment = "PRD-STG" })
}
