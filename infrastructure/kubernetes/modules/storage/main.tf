resource "kubernetes_storage_class" "azurefile_csi_temp_data" {
  metadata {
    name = var.temp_data_storage_class
  }
  storage_provisioner = "file.csi.azure.com"
  reclaim_policy      = "Delete"
  parameters = {
    protocol = "nfs"
  }
  mount_options = ["nconnect=8"]
}
