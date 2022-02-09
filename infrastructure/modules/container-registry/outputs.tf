output "azuread_application" {
  value = azuread_application.github-actions-access
}

output "azuread_service_principal" {
  value = azuread_service_principal.github-actions-access
}

output "azure_client_id" {
  value = azuread_service_principal.github-actions-access.application_id
}

#output "azuread_application_password" {
#  value = nonsensitive(azuread_application_password.github-actions-access.value)
#}
