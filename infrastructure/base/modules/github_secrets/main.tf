resource "github_actions_variable" "azure_aks_cluster_name" {
  repository       = var.repo_name
  variable_name    = "AZURE_AKS_CLUSTER_NAME"
  value            = var.aks_cluster_name
}

resource "github_actions_variable" "azure_aks_host" {
  repository       = var.repo_name
  variable_name    = "AZURE_AKS_HOST"
  value            = var.aks_host
}

resource "github_actions_secret" "azure_client_id" {
  repository       = var.repo_name
  secret_name      = "AZURE_CLIENT_ID"
  plaintext_value  = var.client_id
}

resource "github_actions_variable" "azure_resource_group" {
  repository       = var.repo_name
  variable_name    = "AZURE_RESOURCE_GROUP"
  value            = var.resource_group_name
}

resource "github_actions_secret" "azure_subscription_id" {
  repository       = var.repo_name
  secret_name      = "AZURE_SUBSCRIPTION_ID"
  plaintext_value  = var.subscription_id
}

resource "github_actions_secret" "azure_tenant_id" {
  repository       = var.repo_name
  secret_name      = "AZURE_TENANT_ID"
  plaintext_value  = var.tenant_id
}

resource "github_actions_variable" "bastion_host" {
  repository       = var.repo_name
  variable_name    = "BASTION_HOST"
  value            = var.bastion_host
}

resource "github_actions_secret" "bastion_ssh_private_key" {
  repository       = var.repo_name
  secret_name      = "BASTION_SSH_PRIVATE_KEY"
  plaintext_value  = var.bastion_ssh_private_key
}

resource "github_actions_variable" "bastion_user" {
  repository       = var.repo_name
  variable_name    = "BASTION_USER"
  value            = var.bastion_user
}

resource "github_actions_variable" "registry_login_server" {
  repository       = var.repo_name
  variable_name    = "REGISTRY_LOGIN_SERVER"
  value            = var.registry_login_server
}

resource "github_actions_secret" "registry_password" {
  repository       = var.repo_name
  secret_name      = "REGISTRY_PASSWORD"
  plaintext_value  = var.registry_password
}

resource "github_actions_variable" "registry_username" {
  repository       = var.repo_name
  variable_name    = "REGISTRY_USERNAME"
  value            = var.registry_username
}

resource "github_actions_variable" "mapbox_api_token" {
  repository       = var.repo_name
  variable_name    = "NEXT_PUBLIC_MAPBOX_API_TOKEN"
  value            = var.mapbox_api_token
}

resource "github_actions_variable" "contact_email" {
  repository       = var.repo_name
  variable_name    = "NEXT_PUBLIC_CONTACT_EMAIL"
  value  = var.support_email
}

resource "github_actions_variable" "next_public_api_url_production" {
  repository       = var.repo_name
  variable_name    = "NEXT_PUBLIC_API_URL_PRODUCTION"
  value            = "https://api.${var.domain}"
}

resource "github_actions_variable" "next_public_url_production" {
  repository       = var.repo_name
  variable_name    = "NEXT_PUBLIC_URL_PRODUCTION"
  value            = "https://${var.domain}"
}

resource "github_actions_variable" "nextauth_url_production" {
  repository       = var.repo_name
  variable_name    = "NEXTAUTH_URL_PRODUCTION"
  value            = "https://client.${var.domain}"
}

resource "github_actions_variable" "next_public_api_url_staging" {
  repository       = var.repo_name
  variable_name    = "NEXT_PUBLIC_API_URL_STAGING"
  value            = "https://api.staging.${var.domain}"
}

resource "github_actions_variable" "next_public_url_staging" {
  repository       = var.repo_name
  variable_name    = "NEXT_PUBLIC_URL_STAGING"
  value            = "https://staging.${var.domain}"
}

resource "github_actions_variable" "nextauth_url_staging" {
  repository       = var.repo_name
  variable_name    = "NEXTAUTH_URL_STAGING"
  value            = "https://client.staging.${var.domain}"
}
