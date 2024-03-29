output "postgresql_hostname" {
  value       = data.azurerm_postgresql_flexible_server.marxan.fqdn
  description = "PostgreSQL server hostname"
}

output "postgresql_username" {
  value       = local.username
  description = "PostgreSQL database username"
}

output "postgresql_password" {
  value       = random_password.postgresql_user_password_generator.result
  description = "PostgreSQL database password"
}

output "postgresql_database" {
  value       = local.database
  description = "PostgreSQL database name"
}
