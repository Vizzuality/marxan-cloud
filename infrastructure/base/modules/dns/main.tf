resource "azurerm_dns_zone" "marxan" {
  name                = var.domain
  resource_group_name = var.resource_group.name
}
