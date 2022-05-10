resource "kubernetes_persistent_volume_claim" "shared_temp_data_storage" {
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

resource "kubernetes_persistent_volume_claim" "shared_cloning_storage" {
  metadata {
    name      = var.cloning_pvc_name
    namespace = var.namespace
  }
  spec {
    access_modes = ["ReadWriteMany"]
    storage_class_name = var.cloning_storage_class
    resources {
      requests = {
        storage = var.cloning_storage_size
      }
    }
  }
}
