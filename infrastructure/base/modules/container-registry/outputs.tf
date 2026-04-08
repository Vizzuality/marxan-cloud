output "azurerm_container_registry_login_server" {
  value = azurerm_container_registry.acr.login_server
}

output "azurerm_container_registry_id" {
  value = azurerm_container_registry.acr.id
}

output "azuread_application" {
  value = azuread_application.github-actions-access
}

output "azuread_service_principal" {
  value = azuread_service_principal.github-actions-access
}

output "azure_client_id" {
  value = azuread_service_principal.github-actions-access.application_id
}

# TODO: remove once the ACR token login is approved and integrated
output "azuread_application_username" {
  value = nonsensitive(azuread_application_password.github-actions-access.value)
}

# TODO: remove once the ACR token login is approved and integrated
output "azuread_application_password" {
  value = nonsensitive(azuread_application_password.github-actions-access.value)
}

# ──────────────────────────────────────────────────────────────────────────────
# ACR token-based authentication outputs
# ──────────────────────────────────────────────────────────────────────────────

output "azurerm_container_registry_name" {
  value = azurerm_container_registry.acr.name
}

output "registry_token_username" {
  value = azurerm_container_registry_token.ci_push.name
}

output "registry_token_password" {
  value     = azurerm_container_registry_token_password.ci_push.password1[0].value
  sensitive = true
}
