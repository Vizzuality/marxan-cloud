resource "azurerm_storage_container" "cloning_storage_backup_storage_container" {
  name                  = var.cloning_storage_backup_container
  storage_account_name  = var.cloning_storage_backup_storage_account
  container_access_type = "private"
}
