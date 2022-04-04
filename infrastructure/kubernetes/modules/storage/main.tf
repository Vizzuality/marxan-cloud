resource "kubernetes_storage_class" "azurefile_csi_nfs" {
  metadata {
    name = var.backend_storage_class
  }
  storage_provisioner = "file.csi.azure.com"
  reclaim_policy      = "Delete"
  parameters = {
    protocol = "nfs"
  }
  mount_options = ["nconnect=8"]
}

resource "kubernetes_persistent_volume_claim" "backend_shared_spatial_data_storage" {
  metadata {
    # @debt use var
    name      = "backend-shared-spatial-data-storage"
    namespace = var.namespace
  }
  spec {
    access_modes = ["ReadWriteMany"]
    storage_class_name = var.backend_storage_class
    resources {
      requests = {
        storage = var.backend_storage_size
      }
    }
  }
}
