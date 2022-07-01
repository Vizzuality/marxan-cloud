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
  name         = "Postgres${title(var.name)}AdminPassword"
  value        = jsonencode(local.postgres_secret_json)
  key_vault_id = var.key_vault_id
}

resource "helm_release" "postgres" {
  name       = "${var.name}-postgres"
  repository = "https://charts.bitnami.com/bitnami"
  chart      = "postgresql"
  version    = "11.6.12"

  namespace = var.namespace

  values = [
    file("${path.module}/values.yaml")
  ]

  set {
    name  = "auth.username"
    value = sensitive(local.postgres_secret_json.username)
  }

  set {
    name  = "auth.password"
    value = sensitive(local.postgres_secret_json.password)
  }

  set {
    name  = "auth.existingSecret"
    value = "${var.name}-postgres-secret"
  }

  set {
    name  = "auth.secretKeys.adminPasswordKey"
    value = "postgresql-password"
  }

  set {
    name  = "image.registry"
    value = "${var.container_registry_name}.azurecr.io"
  }
}

resource "kubernetes_secret" "postgres-secret" {
  metadata {
    name      = "${var.name}-postgres-secret"
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
    name      = "${var.name}-postgresql"
  }
}
