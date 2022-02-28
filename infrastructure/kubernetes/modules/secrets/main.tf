locals {
  api_postgres_secret_json = {
    username = "api-${var.namespace}"
    password = random_password.postgresql_api_user_generator.result
    database = "api-${var.namespace}"
  }
  geoprocessing_postgres_secret_json = {
    username = "geoprocessing-${var.namespace}"
    password = random_password.postgresql_geoprocessing_user_generator.result
    database = "geoprocessing-${var.namespace}"
  }

  api_auth_jwt_secret = random_password.jwt_secret.result
  x_auth_api_key      = random_password.x_auth_api_key.result
}

resource "random_password" "postgresql_api_user_generator" {
  length  = 24
  special = true
}

resource "random_password" "postgresql_geoprocessing_user_generator" {
  length  = 24
  special = true
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
  value        = jsonencode(local.api_postgres_secret_json)
  key_vault_id = var.key_vault_id
}

resource "kubernetes_secret" "api_secret" {
  metadata {
    name      = "api"
    namespace = var.namespace
  }

  data = {
    API_AUTH_JWT_SECRET = sensitive(local.api_auth_jwt_secret)
    API_AUTH_X_API_KEY  = sensitive(local.x_auth_api_key)

    API_POSTGRES_HOST     = "api-postgres-postgresql.${var.namespace}.svc.cluster.local"
    API_POSTGRES_USER     = sensitive(local.api_postgres_secret_json.username)
    API_POSTGRES_PASSWORD = sensitive(local.api_postgres_secret_json.password)
    API_POSTGRES_DB       = sensitive(local.api_postgres_secret_json.database)

    GEO_POSTGRES_HOST     = "geoprocessing-postgres-postgresql.${var.namespace}.svc.cluster.local"
    GEO_POSTGRES_USER     = sensitive(local.geoprocessing_postgres_secret_json.username)
    GEO_POSTGRES_PASSWORD = sensitive(local.geoprocessing_postgres_secret_json.password)
    GEO_POSTGRES_DB       = sensitive(local.geoprocessing_postgres_secret_json.database)

    REDIS_HOST     = var.redis_host
    REDIS_PASSWORD = var.redis_password
    REDIS_PORT     = var.redis_port
  }
}

resource "kubernetes_secret" "geoprocessing_secret" {
  metadata {
    name      = "geoprocessing"
    namespace = var.namespace
  }

  data = {
    API_AUTH_JWT_SECRET = sensitive(local.api_auth_jwt_secret)
    API_AUTH_X_API_KEY  = sensitive(local.x_auth_api_key)

    API_POSTGRES_HOST     = "api-postgres-postgresql.${var.namespace}.svc.cluster.local"
    API_POSTGRES_USER     = sensitive(local.api_postgres_secret_json.username)
    API_POSTGRES_PASSWORD = sensitive(local.api_postgres_secret_json.password)
    API_POSTGRES_DB       = sensitive(local.api_postgres_secret_json.database)

    GEO_POSTGRES_HOST     = "geoprocessing-postgres-postgresql.${var.namespace}.svc.cluster.local"
    GEO_POSTGRES_USER     = sensitive(local.geoprocessing_postgres_secret_json.username)
    GEO_POSTGRES_PASSWORD = sensitive(local.geoprocessing_postgres_secret_json.password)
    GEO_POSTGRES_DB       = sensitive(local.geoprocessing_postgres_secret_json.database)

    REDIS_HOST     = var.redis_host
    REDIS_PASSWORD = var.redis_password
    REDIS_PORT     = var.redis_port
  }
}




