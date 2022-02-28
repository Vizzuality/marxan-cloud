# Based on https://docs.microsoft.com/en-us/azure/container-instances/container-instances-github-action
#
# The guide above requires the output from "az ad sp create-for-rbac --sdk-auth"
# However, AFAICT and according to https://github.com/Azure/login/issues/190
# that output format is on the way out, and using "--sdk-auth" does trigger a deprecation
# warning on the CLI
#
# In the future, this may be tweaked to use something else (password?) and we may
# come full circle.
# For the time being, that's not possible.

resource "azurerm_container_registry" "acr" {
  name                = var.project_name
  resource_group_name = var.resource_group.name
  location            = var.resource_group.location
  sku                 = "Basic"
}

resource "azuread_application" "github-actions-access" {
  display_name = "github-actions-access"

  api {
    mapped_claims_enabled          = false
    requested_access_token_version = 1

    oauth2_permission_scope {
      admin_consent_description  = "Allow the application to access github-actions-access on behalf of the signed-in user."
      admin_consent_display_name = "Access github-actions-access"
      enabled                    = true
      id                         = "2269e240-34ec-404e-ac6f-0980c7d1d81d"
      type                       = "User"
      user_consent_description   = "Allow the application to access github-actions-access on your behalf."
      user_consent_display_name  = "Access github-actions-access"
      value                      = "user_impersonation"
    }
  }

  web {
    implicit_grant {
      access_token_issuance_enabled = false
      id_token_issuance_enabled     = true
    }
  }
}

resource "azuread_service_principal" "github-actions-access" {
  application_id               = azuread_application.github-actions-access.application_id
  app_role_assignment_required = false
}

resource "azurerm_role_assignment" "resource-group-contributor" {
  scope                = var.resource_group.id
  role_definition_name = "Contributor"
  principal_id         = azuread_service_principal.github-actions-access.object_id
}

resource "azuread_application_password" "github-actions-access" {
  application_object_id = azuread_application.github-actions-access.object_id
}

resource "azurerm_role_assignment" "acr-push" {
  scope                = azurerm_container_registry.acr.id
  role_definition_name = "AcrPush"
  principal_id         = azuread_service_principal.github-actions-access.object_id
}

resource "azuread_application_federated_identity_credential" "github-actions-access-develop" {
  application_object_id = azuread_application.github-actions-access.object_id
  display_name          = "github-actions-access-develop"
  description           = "Deployments from github actions"
  audiences             = ["api://AzureADTokenExchange"]
  issuer                = "https://token.actions.githubusercontent.com"
  subject               = "repo:Vizzuality/marxan-cloud:ref:refs/heads/develop"
}

resource "azuread_application_federated_identity_credential" "github-actions-access-main" {
  application_object_id = azuread_application.github-actions-access.object_id
  display_name          = "github-actions-access-main"
  description           = "Deployments from github actions"
  audiences             = ["api://AzureADTokenExchange"]
  issuer                = "https://token.actions.githubusercontent.com"
  subject               = "repo:Vizzuality/marxan-cloud:ref:refs/heads/main"
}
