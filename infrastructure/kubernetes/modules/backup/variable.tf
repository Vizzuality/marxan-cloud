variable "namespace" {
  type        = string
  description = "The k8s namespace to use"
}

variable "cloning_pvc_name" {
  type        = string
  description = "Name of the PVC to use for backend storage for cloning"
}

variable "backup_source" {
  type        = string
  description = "Path of the directory to back up"
}

variable "azure_storage_account_name" {
  type        = string
  description = "Azure storage account that holds the blob storage container used for backups"
}

variable "azure_storage_account_key" {
  type        = string
  description = "The storage account key to be used to connect to the storage container"
}

variable "restic_repository" {
  type        = string
  description = "azure:<container>/<path> URL of the backup destination"
}

variable "restic_forget_cli_parameters" {
  type        = string
  description = "CLI parameters instructing Restic on how to remove backup snapshots (see https://restic.readthedocs.io/en/stable/060_forget.html)"
}

variable "schedule" {
  type        = string
  description = "The cron schedule on which this job should be run"
  default     = "15 23 * * *"
}
