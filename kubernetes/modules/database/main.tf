locals {
  postgres_secret_json = {
    username = "postgres"
    password = random_password.postgresql_admin_generator.result
  }
}

resource "random_password" "postgresql_admin_generator" {
  length  = 24
  special = true
}

resource "azurerm_key_vault_secret" "postgresql" {
  name         = "${title(var.project_name)}${title(var.namespace)}PostgresAdminPassword"
  value        = jsonencode(local.postgres_secret_json)
  key_vault_id = var.key_vault_id
}

resource "helm_release" "postgres" {
  name       = "postgres"
  repository = "https://charts.bitnami.com/bitnami"
  chart      = "postgresql"
  version    = "9.4.1"

  namespace = var.namespace

  values = [
    file("${path.module}/values.yaml")
  ]

  set {
    name  = "postgresqlUsername"
    value = sensitive(local.postgres_secret_json.username)
  }

  set {
    name  = "postgresqlPostgresPassword"
    value = sensitive(local.postgres_secret_json.password)
  }

  set {
    name  = "existingSecret"
    value = "postgres-secret"
  }
}

resource "kubernetes_secret" "postgres-secret" {
  metadata {
    name      = "postgres-secret"
    namespace = var.namespace
  }

  data = {
    postgresql-password          = sensitive(local.postgres_secret_json.password)
    postgresql-postgres-password = sensitive(local.postgres_secret_json.password)
  }
}

data "kubernetes_service" "postgresql" {
  metadata {
    namespace = var.namespace
    name      = "postgres-postgresql"
  }
}
