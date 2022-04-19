resource "azurerm_redis_cache" "marxan" {
  name                          = var.project_name
  location                      = var.resource_group.location
  resource_group_name           = var.resource_group.name
  capacity                      = var.redis_cache_capacity
  family                        = var.redis_cache_family
  sku_name                      = var.redis_cache_sku_name
  enable_non_ssl_port           = true
  minimum_tls_version           = "1.2"
  public_network_access_enabled = false
  redis_version                 = var.redis_version

  redis_configuration {
  }
}
