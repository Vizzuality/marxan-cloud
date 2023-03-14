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

  api_auth_jwt_secret                    = var.api_auth_jwt_secret
  x_auth_api_key                         = var.x_auth_api_key
  cloning_signing_secret                 = var.cloning_signing_secret
  cloning_storage_backup_restic_password = var.cloning_storage_backup_restic_password
}

resource "kubernetes_secret" "api_secret" {
  metadata {
    name      = "api"
    namespace = var.namespace
  }

  data = {
    API_AUTH_JWT_SECRET    = sensitive(local.api_auth_jwt_secret)
    API_AUTH_X_API_KEY     = sensitive(local.x_auth_api_key)
    CLONING_SIGNING_SECRET = sensitive(base64encode(local.cloning_signing_secret))

    API_POSTGRES_HOST     = var.postgres_api_hostname
    API_POSTGRES_USER     = sensitive(local.api_postgres_secret_json.username)
    API_POSTGRES_PASSWORD = sensitive(local.api_postgres_secret_json.password)
    API_POSTGRES_DB       = sensitive(local.api_postgres_secret_json.database)

    GEO_POSTGRES_HOST     = var.postgres_geoprocessing_hostname
    GEO_POSTGRES_USER     = sensitive(local.geoprocessing_postgres_secret_json.username)
    GEO_POSTGRES_PASSWORD = sensitive(local.geoprocessing_postgres_secret_json.password)
    GEO_POSTGRES_DB       = sensitive(local.geoprocessing_postgres_secret_json.database)

    REDIS_HOST     = var.redis_host
    REDIS_PASSWORD = var.redis_password
    REDIS_PORT     = var.redis_port

    SPARKPOST_APIKEY = var.sparkpost_api_key
    API_SERVICE_URL  = var.api_url

    AZURE_STORAGE_ACCOUNT_KEY              = sensitive(var.azure_storage_account_key)
    CLONING_STORAGE_BACKUP_RESTIC_PASSWORD = sensitive(local.cloning_storage_backup_restic_password)
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

    API_POSTGRES_HOST     = var.postgres_api_hostname
    API_POSTGRES_USER     = sensitive(local.api_postgres_secret_json.username)
    API_POSTGRES_PASSWORD = sensitive(local.api_postgres_secret_json.password)
    API_POSTGRES_DB       = sensitive(local.api_postgres_secret_json.database)

    GEO_POSTGRES_HOST     = var.postgres_geoprocessing_hostname
    GEO_POSTGRES_USER     = sensitive(local.geoprocessing_postgres_secret_json.username)
    GEO_POSTGRES_PASSWORD = sensitive(local.geoprocessing_postgres_secret_json.password)
    GEO_POSTGRES_DB       = sensitive(local.geoprocessing_postgres_secret_json.database)

    REDIS_HOST     = var.redis_host
    REDIS_PASSWORD = var.redis_password
    REDIS_PORT     = var.redis_port
  }
}
