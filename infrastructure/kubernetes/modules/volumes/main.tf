resource "kubernetes_persistent_volume_claim" "backend_shared_spatial_data_storage" {
  metadata {
    name      = var.temp_data_pvc_name
    namespace = var.namespace
  }
  spec {
    access_modes = ["ReadWriteMany"]
    storage_class_name = var.temp_data_storage_class
    resources {
      requests = {
        storage = var.temp_data_storage_size
      }
    }
  }
}
