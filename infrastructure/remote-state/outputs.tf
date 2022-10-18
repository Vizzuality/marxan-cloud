output "storage_account_primary_access_key" {
  value = data.azurerm_storage_account.storage_account.primary_access_key
}

output "storage_account_name" {
  value = data.azurerm_storage_account.storage_account.name
}
