locals {
  api_postgres_secret_json = {
    username = var.postgres_api_username
    password = var.postgres_api_password
    database = var.postgres_api_database
  }
  geoprocessing_postgres_secret_json = {
    username = var.postgres_geoprocessing_username
    password = var.postgres_geoprocessing_password
    database = var.postgres_geoprocessing_database
  }

  api_auth_jwt_secret                    = random_password.jwt_secret.result
  x_auth_api_key                         = random_password.x_auth_api_key.result
  cloning_signing_secret                 = tls_private_key.cloning_signing_secret.private_key_pem
  cloning_storage_backup_restic_password = random_password.cloning_storage_backup_restic_password.result
}

resource "random_password" "jwt_secret" {
  length  = 24
  special = true
}

resource "random_password" "x_auth_api_key" {
  length  = 24
  special = true
}

resource "azurerm_key_vault_secret" "api_user_postgresql" {
  name         = "PostgresApiUserPassword"
  value        = jsonencode(local.api_postgres_secret_json)
  key_vault_id = var.key_vault_id
}

resource "azurerm_key_vault_secret" "geoprocessing_user_postgresql" {
  name         = "PostgresGeoprocessingUserPassword"
  value        = jsonencode(local.geoprocessing_postgres_secret_json)
  key_vault_id = var.key_vault_id
}

resource "tls_private_key" "cloning_signing_secret" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "random_password" "cloning_storage_backup_restic_password" {
  length           = 16
  special          = true
}
