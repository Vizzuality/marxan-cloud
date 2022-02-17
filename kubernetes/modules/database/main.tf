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

data "azurerm_client_config" "current" {}

data "azurerm_user_assigned_identity" "aks_identity" {
  name                = "${var.project_name}AKSClusterIdentity"
  resource_group_name = var.resource_group.name
}

resource "azurerm_key_vault" "postgresql" {
  name                       = "postgresql"
  location                   = var.resource_group.location
  resource_group_name        = var.resource_group.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"
  soft_delete_retention_days = 7

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    secret_permissions = [
      "set",
      "get",
      "delete",
      "purge",
      "recover"
    ]
  }

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_user_assigned_identity.aks_identity.object_id

    secret_permissions = [
      "get",
    ]
  }
}

resource "azurerm_key_vault_secret" "postgresql" {
  name         = "${var.project_name}PostgresAdminPassword"
  value        = jsonencode(local.postgres_secret_json)
  key_vault_id = azurerm_key_vault.postgresql.id
}

#resource "aws_secretsmanager_secret" "postgresql_admin_secret" {
#  name        = "postgresql-admin-credentials"
#  description = "Credentials for the admin user of the K8S PostgreSQL Server"
#}
#
#resource "aws_secretsmanager_secret_version" "postgresql_admin_secret_version" {
#  secret_id     = aws_secretsmanager_secret.postgresql_admin_secret.id
#  secret_string = jsonencode(local.postgres_secret_json)
#}

resource "helm_release" "postgres" {
  name       = "postgres"
  repository = "https://charts.bitnami.com/bitnami"
  chart      = "postgresql"
  version    = "9.4.1"

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
    name = "postgres-secret"
  }

  data = {
    postgresql-password          = sensitive(local.postgres_secret_json.password)
    postgresql-postgres-password = sensitive(local.postgres_secret_json.password)
  }
}

data "kubernetes_service" "postgresql" {
  metadata {
    name = "postgres-postgresql"
  }
}
