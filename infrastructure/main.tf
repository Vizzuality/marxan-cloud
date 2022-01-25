terraform {
  backend "azurerm" {
    resource_group_name  = "marxan" // var.project_name
    storage_account_name = "marxan" // var.project_name
    container_name       = "marxantfstate" // ${var.project_name}tfstate
    key                  = "marxan.tfstate" // ${var.project_name}.tfstate
  }
}

data "azurerm_resource_group" "resource_group" {
  name = var.project_name
}

module "network" {
  source = "./modules/network"
  resource_group = data.azurerm_resource_group.resource_group
  project_name = var.project_name
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
}
