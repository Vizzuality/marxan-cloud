variable "cloning_storage_backup_container" {
  type        = string
  description = "Name of the storage container to use for backups of the cloning storage data"
}

variable "cloning_storage_backup_storage_account" {
  type        = string
  description = "Name of the parent storage account of the storage container for backups of the cloning storage data"
}
