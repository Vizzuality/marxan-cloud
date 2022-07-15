locals {
  database = "${var.name}-${var.namespace}"
  username = "${var.name}-${var.namespace}"
  password = random_password.postgresql_admin_generator.result
}

resource "random_password" "postgresql_admin_generator" {
  length  = 24
  special = true
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

data "kubernetes_service" "postgresql" {
  metadata {
    namespace = var.namespace
    name      = "${var.name}-postgresql"
  }
}

provider "postgresql" {
  host      = module.db_tunnel.host
  port      = module.db_tunnel.port
  username  = var.sql_server_username
  password  = var.sql_server_password
  sslmode   = "require"
  superuser = false
}

module db_tunnel {
  # You can also retrieve this module from the terraform registry
  source  = "flaupretre/tunnel/ssh"
  version = "1.8.0"

  target_host = data.azurerm_postgresql_flexible_server.marxan.fqdn
  target_port = 5432

  gateway_host = var.bastion_host
  gateway_user = "ubuntu"
}

resource "postgresql_role" "my_role" {
  name     = local.username
  login    = true
  password = local.password
}

resource "postgresql_grant" "db_grant" {
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
  database = local.database
  name     = "postgis"
}

resource "postgresql_extension" "marxan_pgcrypto" {
  database = local.database
  name     = "pgcrypto"
}

resource "postgresql_extension" "marxan_plpgsql" {
  database = local.database
  name     = "plpgsql"
}

resource "postgresql_extension" "marxan_postgis_raster" {
  database = local.database
  name     = "postgis_raster"

  depends_on = [
    postgresql_extension.marxan_postgis
  ]
}

resource "postgresql_extension" "marxan_postgis_topology" {
  database = local.database
  name     = "postgis_topology"

  depends_on = [
    postgresql_extension.marxan_postgis
  ]
}
