resource "azurerm_virtual_network" "landgriffon" {
  name                = var.virtual_network_name
  location            = azurerm_resource_group.landgriffon.location
  resource_group_name = azurerm_resource_group.landgriffon.name
  address_space       = ["10.0.0.0/16"]
}

resource "azurerm_subnet" "landgriffon" {
  name                 = var.subnet_name
  resource_group_name  = azurerm_resource_group.landgriffon.name
  virtual_network_name = azurerm_virtual_network.landgriffon.name
  address_prefixes     = ["10.0.2.0/24"]
  service_endpoints    = ["Microsoft.Storage"]
  delegation {
    name = "fs"
    service_delegation {
      name = "Microsoft.DBforPostgreSQL/flexibleServers"
      actions = [
        "Microsoft.Network/virtualNetworks/subnets/join/action",
      ]
    }
  }
}

resource "azurerm_private_dns_zone" "landgriffon" {
  name                = "landgriffon.postgres.database.azure.com"
  resource_group_name = azurerm_resource_group.landgriffon.name
}

resource "azurerm_private_dns_zone_virtual_network_link" "landgriffon" {
  name                  = "landgriffon.com"
  private_dns_zone_name = azurerm_private_dns_zone.landgriffon.name
  virtual_network_id    = azurerm_virtual_network.landgriffon.id
  resource_group_name   = azurerm_resource_group.landgriffon.name
}