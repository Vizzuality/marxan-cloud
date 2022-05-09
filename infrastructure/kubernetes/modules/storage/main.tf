resource "kubernetes_storage_class" "azurefile_csi_temp_data" {
  metadata {
    name = var.temp_data_storage_class
  }
  storage_provisioner    = "file.csi.azure.com"
  reclaim_policy         = "Delete"
  allow_volume_expansion = true
  mount_options = {
    dir_mode  = "0640"
    file_mode = "0640"
    cache     = "strict" # In case kernel is < 3.7
  }
}
