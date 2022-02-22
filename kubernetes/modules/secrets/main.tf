locals {
  postgres_secret_json = {
    username = "landgriffon-${var.namespace}"
    password = random_password.postgresql_user_generator.result
    database = "landgriffon-${var.namespace}"
  }
}

resource "random_password" "postgresql_user_generator" {
  length  = 24
  special = true
}


resource "azurerm_key_vault_secret" "postgresql" {
  name         = "${title(var.project_name)}${title(var.namespace)}Postgres${title(var.name)}Password"
  value        = jsonencode(local.postgres_secret_json)
  key_vault_id = var.key_vault_id
}

resource "kubernetes_secret" "secret" {
  metadata {
    name      = var.name
    namespace = var.namespace
  }

  data = {
    DB_HOST     = "postgres-postgresql.${var.namespace}.svc.cluster.local"
    DB_USERNAME = sensitive(local.postgres_secret_json.username)
    DB_PASSWORD = sensitive(local.postgres_secret_json.password)
    DB_DATABASE = sensitive(local.postgres_secret_json.database)
  }
}




