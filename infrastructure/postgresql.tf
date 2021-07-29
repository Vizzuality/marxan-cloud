resource "random_password" "postgresql_superuser" {
  length  = 16
  special = false
}

resource "azurerm_postgresql_flexible_server" "landgriffon" {
  name                   = "landgriffon-psqlflexibleserver"
  resource_group_name    = azurerm_resource_group.landgriffon.name
  location               = azurerm_resource_group.landgriffon.location
  version                = "13"
  delegated_subnet_id    = azurerm_subnet.landgriffon.id
  private_dns_zone_id    = azurerm_private_dns_zone.landgriffon.id
  administrator_login    = "psqladminun"
  administrator_password = random_password.postgresql_superuser.result

  storage_mb = 32768

  sku_name   = "GP_Standard_D4s_v3"
  depends_on = [azurerm_private_dns_zone_virtual_network_link.landgriffon]

}
