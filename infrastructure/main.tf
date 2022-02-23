terraform {
  backend "azurerm" {
    resource_group_name  = "marxan" // var.project_name
    storage_account_name = "marxan" // var.project_name
    container_name       = "marxantfstate" // ${var.project_name}tfstate
    key                  = "infrastructure.tfstate"
  }
}

data "azurerm_resource_group" "resource_group" {
  name = var.project_name
}

data "azurerm_subscription" "subscription" {
}

module "network" {
  source = "./modules/network"
  resource_group = data.azurerm_resource_group.resource_group
  project_name = var.project_name
}

module "bastion" {
  source = "./modules/bastion"
  resource_group = data.azurerm_resource_group.resource_group
  project_name = var.project_name
  bastion_ssh_public_keys = var.bastion_ssh_public_keys
  bastion_subnet_id = module.network.bastion_subnet_id
}

module "container_registry" {
  source = "./modules/container-registry"
  resource_group = data.azurerm_resource_group.resource_group
  project_name = var.project_name
}

module "kubernetes" {
  source = "./modules/kubernetes"
  resource_group = data.azurerm_resource_group.resource_group
  project_name = var.project_name
  aks_subnet_id = module.network.aks_subnet_id
  virtual_networks_to_link     = {
    (module.network.core_vnet_name) = module.network.core_vnet_id
    (module.network.aks_vnet_name) = module.network.aks_vnet_id
  }
  acr_id = module.container_registry.azurerm_container_registry_id

  aks_vnet_id = module.network.aks_vnet_id
  aks_vnet_name = module.network.aks_vnet_name

  gateway_subnet_id = module.network.app_gateway_subnet_id
}

module "data_node_pool" {
  source = "./modules/node_pool"
  name = "data"
  aks_cluster_id = module.kubernetes.cluster_id
  resource_group = data.azurerm_resource_group.resource_group
  project_name = var.project_name
  subnet_id = module.network.aks_subnet_id
  node_labels = {
    type : "data"
  }
}

module "app_node_pool" {
  source = "./modules/node_pool"
  name = "app"
  aks_cluster_id = module.kubernetes.cluster_id
  resource_group = data.azurerm_resource_group.resource_group
  project_name = var.project_name
  subnet_id = module.network.aks_subnet_id
  node_labels = {
    type : "app"
  }
}

module "redis" {
  source = "./modules/redis"
  resource_group = data.azurerm_resource_group.resource_group
  project_name = var.project_name
}

module "log_analytics_workspace" {
  source                           = "./modules/log_analytics"
  name                             = var.log_analytics_workspace_name
  location                         = var.location
  resource_group_name              = data.azurerm_resource_group.resource_group.name
  solution_plan_map                = var.solution_plan_map
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
}

module "routetable" {
  source               = "./modules/route_table"
  resource_group_name  = data.azurerm_resource_group.resource_group.name
  location             = var.location
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
}

#module "acr_private_dns_zone" {
#  source                       = "./modules/private_dns_zone"
#  name                         = "privatelink.azurecr.io"
#  resource_group               = data.azurerm_resource_group.resource_group
#  virtual_networks_to_link     = {
#    (module.network.core_vnet_name) = {
#      subscription_id = data.azurerm_subscription.subscription.subscription_id
#      resource_group_name = data.azurerm_resource_group.resource_group.name
#    }
#    (module.network.aks_vnet_name) = {
#      subscription_id = data.azurerm_subscription.subscription.subscription_id
#      resource_group_name = data.azurerm_resource_group.resource_group.name
#    }
#  }
#}
#
#module "acr_private_endpoint" {
#  source                         = "./modules/private_endpoint"
#  name                           = "${var.project_name}ACRPrivateEndpoint"
#  location                       = var.location
#  resource_group_name            = data.azurerm_resource_group.resource_group.name
#  subnet_id                      = module.network.bastion_subnet_id
#  private_connection_resource_id = module.container_registry.azurerm_container_registry_id
#  is_manual_connection           = false
#  subresource_name               = "registry"
#  private_dns_zone_group_name    = "AcrPrivateDnsZoneGroup"
#  private_dns_zone_group_ids     = [module.acr_private_dns_zone.id]
#}
