resource "kubernetes_storage_class" "azurefile_csi_temp_data" {
  metadata {
    name = var.temp_data_storage_class
  }
  storage_provisioner    = "file.csi.azure.com"
  reclaim_policy         = "Delete"
  allow_volume_expansion = true
  mount_options = [
    "noperm",
    "dir_mode=0777",
    "file_mode=0777",
    "cache=strict", # In case kernel is < 3.7
  ]
}

resource "kubernetes_storage_class" "azurefile_csi_cloning_data" {
  metadata {
    name = var.cloning_storage_class
  }
  storage_provisioner = "file.csi.azure.com"
  reclaim_policy      = "Retain"
  allow_volume_expansion = true
  mount_options = [
    "noperm",
    "dir_mode=0777",
    "file_mode=0777",
    "cache=strict", # In case kernel is < 3.7
  ]
}
