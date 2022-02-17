resource "azurerm_redis_cache" "marxan" {
  name                = "marxan"
  location            = var.resource_group.location
  resource_group_name = var.resource_group.name
  capacity            = var.redis_cache_capacity
  family              = var.redis_cache_family
  sku_name            = var.redis_cache_sku_name
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"
  public_network_access_enabled = false
  redis_version = var.redis_version

  redis_configuration {
  }
}

resource "azurerm_redis_firewall_rule" "marxan" {
  name                = "redis_internal_access"
  redis_cache_name    = azurerm_redis_cache.marxan.name
  resource_group_name = var.resource_group.name
  start_ip            = "10.0.128.0"
  end_ip              = "10.0.131.254"
}
