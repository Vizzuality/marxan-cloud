resource "azurerm_kubernetes_cluster" "k8s_cluster" {
  name                = var.project_name
  location            = var.resource_group.location
  resource_group_name = var.resource_group.name
  dns_prefix          = var.project_name
  kubernetes_version = "1.22.4"

  default_node_pool {
    name       = "default"
    node_count = 1
    vm_size    = "Standard_D2_v2"
  }

  identity {
    type = "SystemAssigned"
  }
}
