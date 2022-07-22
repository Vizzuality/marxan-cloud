locals {
  postgres_secret_json = {
    username = "postgres"
    password = random_password.postgresql_admin_generator.result
  }
}

resource "azurerm_postgresql_flexible_server" "marxan" {
  name                   = "${var.project_name}-sql-server"
  resource_group_name    = var.resource_group.name
  location               = var.resource_group.location
  version                = var.postgresql_version
  delegated_subnet_id    = var.subnet_id
  private_dns_zone_id    = var.private_dns_zone_id
  administrator_login    = local.postgres_secret_json.username
  administrator_password = local.postgres_secret_json.password
  zone                   = "1"

  storage_mb = var.storage_size

  sku_name   = var.instance_size
}

resource "azurerm_postgresql_flexible_server_configuration" "marxan_allowed_extensions" {
  name      = "azure.extensions"
  server_id = azurerm_postgresql_flexible_server.marxan.id
  value     = "postgis,pgcrypto,plpgsql,postgis_raster,postgis_topology"
}

resource "random_password" "postgresql_admin_generator" {
  length  = 24
  special = true
}

resource "azurerm_key_vault_secret" "postgresql" {
  name         = "Postgres${title(var.project_name)}AdminPassword"
  value        = jsonencode(local.postgres_secret_json)
  key_vault_id = var.key_vault_id
}
