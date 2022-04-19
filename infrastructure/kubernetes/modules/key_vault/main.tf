data "azurerm_client_config" "current" {}

data "azuread_users" "users" {
  mail_nicknames = var.key_vault_access_users
}

resource "azurerm_key_vault" "key_vault" {
  name                       = "${title(var.project_name)}${title(var.namespace)}"
  location                   = var.resource_group.location
  resource_group_name        = var.resource_group.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"
  soft_delete_retention_days = 7

  dynamic "access_policy" {
    for_each = distinct(concat([data.azurerm_client_config.current.object_id], data.azuread_users.users.object_ids))
    content {
      tenant_id = data.azurerm_client_config.current.tenant_id
      object_id = access_policy.value

      secret_permissions = [
        "Set",
        "Get",
        "List",
        "Delete",
        "Purge",
        "Recover"
      ]
    }
  }
}
