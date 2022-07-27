resource "github_actions_secret" "azure_aks_cluster_name" {
  repository       = var.repo_name
  secret_name      = "AZURE_AKS_CLUSTER_NAME"
  plaintext_value  = var.aks_cluster_name
}

resource "github_actions_secret" "azure_aks_host" {
  repository       = var.repo_name
  secret_name      = "AZURE_AKS_HOST"
  plaintext_value  = var.aks_host
}

resource "github_actions_secret" "azure_client_id" {
  repository       = var.repo_name
  secret_name      = "AZURE_CLIENT_ID"
  plaintext_value  = var.client_id
}

resource "github_actions_secret" "azure_resource_group" {
  repository       = var.repo_name
  secret_name      = "AZURE_RESOURCE_GROUP"
  plaintext_value  = var.resource_group_name
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

resource "github_actions_secret" "bastion_host" {
  repository       = var.repo_name
  secret_name      = "BASTION_HOST"
  plaintext_value  = var.bastion_host
}

resource "github_actions_secret" "bastion_ssh_private_key" {
  repository       = var.repo_name
  secret_name      = "BASTION_SSH_PRIVATE_KEY"
  plaintext_value  = var.bastion_ssh_private_key
}

resource "github_actions_secret" "bastion_user" {
  repository       = var.repo_name
  secret_name      = "BASTION_USER"
  plaintext_value  = var.bastion_user
}

resource "github_actions_secret" "registry_login_server" {
  repository       = var.repo_name
  secret_name      = "REGISTRY_LOGIN_SERVER"
  plaintext_value  = var.registry_login_server
}

resource "github_actions_secret" "registry_password" {
  repository       = var.repo_name
  secret_name      = "REGISTRY_PASSWORD"
  plaintext_value  = var.registry_password
}

resource "github_actions_secret" "registry_username" {
  repository       = var.repo_name
  secret_name      = "REGISTRY_USERNAME"
  plaintext_value  = var.registry_username
}

resource "github_actions_secret" "mapbox_api_token" {
  repository       = var.repo_name
  secret_name      = "NEXT_PUBLIC_MAPBOX_API_TOKEN"
  plaintext_value  = var.mapbox_api_token
}

resource "github_actions_secret" "contact_email" {
  repository       = var.repo_name
  secret_name      = "NEXT_PUBLIC_CONTACT_EMAIL"
  plaintext_value  = var.support_email
}

resource "github_actions_secret" "next_public_api_url_production" {
  repository       = var.repo_name
  secret_name      = "NEXT_PUBLIC_API_URL_PRODUCTION"
  plaintext_value  = "https://api.${var.domain}"
}

resource "github_actions_secret" "next_public_url_production" {
  repository       = var.repo_name
  secret_name      = "NEXT_PUBLIC_URL_PRODUCTION"
  plaintext_value  = "https://${var.domain}"
}

resource "github_actions_secret" "nextauth_url_production" {
  repository       = var.repo_name
  secret_name      = "NEXTAUTH_URL_PRODUCTION"
  plaintext_value  = "https://client.${var.domain}"
}

resource "github_actions_secret" "next_public_api_url_staging" {
  repository       = var.repo_name
  secret_name      = "NEXT_PUBLIC_API_URL_STAGING"
  plaintext_value  = "https://api.staging.${var.domain}"
}

resource "github_actions_secret" "next_public_url_staging" {
  repository       = var.repo_name
  secret_name      = "NEXT_PUBLIC_URL_STAGING"
  plaintext_value  = "https://staging.${var.domain}"
}

resource "github_actions_secret" "nextauth_url_staging" {
  repository       = var.repo_name
  secret_name      = "NEXTAUTH_URL_STAGING"
  plaintext_value  = "https://client.staging.${var.domain}"
}
