output "id" {
  description = "Specifies the resource id of the sql server."
  value       = azurerm_postgresql_flexible_server.marxan.id
}

output "sql_server_name" {
  value = azurerm_postgresql_flexible_server.marxan.name
}

output "sql_server_username" {
  value = azurerm_postgresql_flexible_server.marxan.administrator_login
}

output "sql_server_url" {
  value = azurerm_postgresql_flexible_server.marxan.fqdn
}

output "sql_server_password" {
  value     = azurerm_postgresql_flexible_server.marxan.administrator_password
  sensitive = true
}
