output "storage_account_primary_access_key" {
  value = data.azurerm_storage_account.storage_account.primary_access_key
  sensitive = true
}
