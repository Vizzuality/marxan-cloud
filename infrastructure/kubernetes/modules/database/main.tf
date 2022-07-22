locals {
  database = "${var.name}-${var.namespace}"
  username = "${var.name}-${var.namespace}"
  password = random_password.postgresql_user_password_generator.result
}

resource "random_password" "postgresql_user_password_generator" {
  length  = 24
  special = false
}

resource "azurerm_key_vault_secret" "postgresql" {
  name         = "Postgres${title(var.name)}AdminPassword"
  value        = jsonencode({ username = local.username, password = local.password })
  key_vault_id = var.key_vault_id
}

data "azurerm_postgresql_flexible_server" "marxan" {
  name                = var.sql_server_name
  resource_group_name = var.resource_group.name
}

resource "azurerm_postgresql_flexible_server_database" "database" {
  name      = local.database
  server_id = data.azurerm_postgresql_flexible_server.marxan.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

resource "postgresql_role" "my_role" {
  provider = postgresql

  name     = local.username
  login    = true
  password = local.password

  depends_on = [
    azurerm_postgresql_flexible_server_database.database
  ]
}

resource "postgresql_grant" "db_grant" {
  provider = postgresql

  database    = local.database
  role        = local.username
  object_type = "database"
  privileges  = ["ALL"]

  depends_on = [
    postgresql_role.my_role,
    azurerm_postgresql_flexible_server_database.database
  ]
}

resource "postgresql_extension" "marxan_postgis" {
  provider = postgresql

  database = local.database
  name     = "postgis"

  depends_on = [
    azurerm_postgresql_flexible_server_database.database
  ]
}

resource "postgresql_extension" "marxan_pgcrypto" {
  provider = postgresql

  database = local.database
  name     = "pgcrypto"

  depends_on = [
    azurerm_postgresql_flexible_server_database.database
  ]
}

resource "postgresql_extension" "marxan_plpgsql" {
  provider = postgresql

  database = local.database
  name     = "plpgsql"

  depends_on = [
    azurerm_postgresql_flexible_server_database.database
  ]
}

resource "postgresql_extension" "marxan_postgis_raster" {
  provider = postgresql

  database = local.database
  name     = "postgis_raster"

  depends_on = [
    postgresql_extension.marxan_postgis,
    azurerm_postgresql_flexible_server_database.database
  ]
}

resource "postgresql_extension" "marxan_postgis_topology" {
  provider = postgresql

  database = local.database
  name     = "postgis_topology"

  depends_on = [
    postgresql_extension.marxan_postgis,
    azurerm_postgresql_flexible_server_database.database
  ]
}
