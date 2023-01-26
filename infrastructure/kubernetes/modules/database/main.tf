locals {
  database = "${var.name}-${var.namespace}"
  username = "${var.name}-${var.namespace}"
  password = random_password.postgresql_user_password_generator.result
}

resource "random_password" "postgresql_user_password_generator" {
  length  = 24
  special = false
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

resource "postgresql_grant" "postgres_user_db_grant" {
  provider = postgresql

  database    = local.database
  role        = "postgres"
  object_type = "database"
  privileges  = [
    "CONNECT",
    "CREATE",
    "TEMPORARY",
  ]

  depends_on = [
    postgresql_role.my_role,
    azurerm_postgresql_flexible_server_database.database
  ]
}

resource "postgresql_grant" "postgres_user_table_grant" {
  provider = postgresql

  database    = local.database
  role        = "postgres"
  object_type = "table"
  schema      = "public"
  privileges  = [
    "DELETE",
    "INSERT",
    "REFERENCES",
    "SELECT",
    "TRIGGER",
    "TRUNCATE",
    "UPDATE",

  ]

  depends_on = [
    postgresql_role.my_role,
    azurerm_postgresql_flexible_server_database.database
  ]
}

resource "postgresql_grant" "postgres_user_sequence_grant" {
  provider = postgresql

  database    = local.database
  role        = "postgres"
  object_type = "sequence"
  schema      = "public"
  privileges  = [
    "SELECT",
    "UPDATE",
    "USAGE",
  ]

  depends_on = [
    postgresql_role.my_role,
    azurerm_postgresql_flexible_server_database.database
  ]
}

resource "postgresql_grant" "db_grant" {
  provider = postgresql

  database    = local.database
  role        = local.username
  object_type = "database"
  privileges  = [
    "CONNECT",
    "CREATE",
    "TEMPORARY",
  ]

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
