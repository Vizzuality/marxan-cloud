resource "azurerm_kubernetes_cluster" "landgriffon" {
  name                = "landgriffon-aks1"
  location            = azurerm_resource_group.landgriffon.location
  resource_group_name = azurerm_resource_group.landgriffon.name
  dns_prefix          = "landgriffonaks1"

  addon_profile {
    kube_dashboard {
      enabled = false
    }
    oms_agent {
      enabled                    = true
      log_analytics_workspace_id = azurerm_log_analytics_workspace.landgriffon.id
    }
  }

  default_node_pool {
    name           = "default"
    node_count     = 1
    vm_size        = "Standard_D2_v2"
  }

  identity {
    type = "SystemAssigned"
  }

  tags = {
  }
}