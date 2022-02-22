output "redis_url" {
  value = azurerm_redis_cache.marxan.hostname
}

output "redis_password" {
  value = azurerm_redis_cache.marxan.primary_access_key
  sensitive = true
}
