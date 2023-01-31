resource "azurerm_kubernetes_cluster_node_pool" "node_pool" {
  name                  = var.name
  kubernetes_cluster_id = var.aks_cluster_id
  vm_size               = var.vm_size
  enable_auto_scaling   = true
  min_count             = var.min_node_count
  max_count             = var.max_node_count
  vnet_subnet_id        = var.subnet_id
  orchestrator_version = var.orchestrator_version

  node_labels = var.node_labels

  lifecycle {
    ignore_changes = [
      node_count
    ]
  }
}
