data "azurerm_client_config" "current" {}

data "azuread_users" "users" {
  user_principal_names = var.key_vault_access_users
}

# data "external" "account_info" {
#   program = [
#     "az",
#     "identity",
#     "show",
#     "--resource-group",
#     var.resource_group,
#     "--name",
#     var.user_assigned_ident_name,
#     "--query",
#     "{principal_id:principalId}",
#   ]
# }

resource "azurerm_key_vault" "key_vault" {
  name                       = "${title(var.key_vault_name_prefix)}${title(var.namespace)}" # This is the kv name. (eg: TncMarxanKvProduction,TncMarxanKvStaging)
  location                   = var.resource_group.location
  resource_group_name        = var.resource_group.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"
  soft_delete_retention_days = 7

  tags = var.project_tags

  dynamic "access_policy" {
    for_each = distinct(concat(data.azuread_users.users.object_ids, [data.azurerm_client_config.current.client_id]))
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
