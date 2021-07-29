resource "azurerm_storage_account" "landgriffon" {
  name                     = var.storage_account_name
  resource_group_name      = azurerm_resource_group.landgriffon.name
  location                 = azurerm_resource_group.landgriffon.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = {
  }
}

resource "azurerm_storage_container" "landgriffon" {
  name                  = var.storage_container_name
  storage_account_name  = azurerm_storage_account.landgriffon.name
  container_access_type = "private"
}