data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "key_vault" {
  name                       = "${title(var.project_name)}${title(var.namespace)}"
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
      "list",
      "delete",
      "purge",
      "recover"
    ]
  }
}
