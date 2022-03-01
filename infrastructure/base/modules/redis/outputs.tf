output "redis_url" {
  value = azurerm_redis_cache.marxan.hostname
}

output "redis_password" {
  value     = azurerm_redis_cache.marxan.primary_access_key
  sensitive = true
}

output "redis_port" {
  value = azurerm_redis_cache.marxan.ssl_port
}

output "id" {
  description = "Specifies the resource id of the redis cluster."
  value       = azurerm_redis_cache.marxan.id
}
