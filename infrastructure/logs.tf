resource "random_id" "workspace" {
  keepers = {
    # Generate a new id each time we switch to a new resource group
    group_name = azurerm_resource_group.landgriffon.name
  }
  byte_length = 8
}

resource "azurerm_log_analytics_workspace" "landgriffon" {
  name                = "landgriffon-workspace-${random_id.workspace.hex}"
  location            = azurerm_resource_group.landgriffon.location
  resource_group_name = azurerm_resource_group.landgriffon.name
  sku                 = "PerGB2018"
}

resource "azurerm_log_analytics_solution" "landgriffon" {
  solution_name         = "ContainerInsights"
  location              = azurerm_resource_group.landgriffon.location
  resource_group_name   = azurerm_resource_group.landgriffon.name
  workspace_resource_id = azurerm_log_analytics_workspace.landgriffon.id
  workspace_name        = azurerm_log_analytics_workspace.landgriffon.name

  plan {
    publisher = "Microsoft"
    product   = "OMSGallery/ContainerInsights"
  }
}