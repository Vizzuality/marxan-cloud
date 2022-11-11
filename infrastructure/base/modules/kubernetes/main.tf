resource "azurerm_user_assigned_identity" "aks_identity" {
  resource_group_name = var.resource_group.name
  location            = var.resource_group.location

  name = "${var.project_name}AKSClusterIdentity"
}

# Theoretically a role with so many permissions should not be needed
# However, if I assign just the Private DNS Zone Contributor role, I get a
# message saying that the identity needs read access to private DNSs,
# which Private DNS Zone Contributor includes
# I suspect there's a bug in generating said error message, and that other
# permissions may be needed, but not output as an error text
# Since I don't want to go chase said permissions list at this point
# "Contributor" quietly solves the problem.
# TODO: Once we have more detail on what permissions the AKS cluster
# needs, fine-tune this.
resource "azurerm_role_assignment" "contributor" {
  scope                            = var.resource_group.id
  role_definition_name             = "Contributor"
  principal_id                     = azurerm_user_assigned_identity.aks_identity.principal_id
  skip_service_principal_aad_check = true
}

resource "azurerm_role_assignment" "private_dns_zone_reader" {
  scope                            = azurerm_private_dns_zone.private_dns_zone.id
  role_definition_name             = "Private DNS Zone Contributor"
  principal_id                     = azurerm_user_assigned_identity.aks_identity.principal_id
  skip_service_principal_aad_check = true
}

resource "azurerm_role_assignment" "key_vault_reader" {
  scope                            = var.resource_group.id
  role_definition_name             = "Key Vault Reader"
  principal_id                     = azurerm_user_assigned_identity.aks_identity.principal_id
  skip_service_principal_aad_check = true
}

resource "azurerm_role_assignment" "attach_acr" {
  scope                = var.acr_id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_kubernetes_cluster.k8s_cluster.kubelet_identity[0].object_id
}

resource "azurerm_private_dns_zone" "private_dns_zone" {
  name                = "${replace(var.project_name, "-", "")}.privatelink.${lower(replace(var.resource_group.location, " ", ""))}.azmk8s.io"
  resource_group_name = var.resource_group.name
}

resource "azurerm_private_dns_zone_virtual_network_link" "link" {
  for_each = var.virtual_networks_to_link

  name                  = "link_to_${lower(basename(each.key))}"
  resource_group_name   = var.resource_group.name
  private_dns_zone_name = azurerm_private_dns_zone.private_dns_zone.name
  virtual_network_id    = each.value
}

resource "azurerm_kubernetes_cluster" "k8s_cluster" {
  name                      = var.project_name
  location                  = var.resource_group.location
  resource_group_name       = var.resource_group.name
  dns_prefix                = var.project_name
  kubernetes_version        = var.kubernetes_version
  automatic_channel_upgrade = "patch"

  maintenance_window {
    allowed {
      day   = "Sunday"
      hours = [22, 23]
    }
    allowed {
      day   = "Monday"
      hours = [1, 2, 3, 4, 5]
    }
  }

  private_dns_zone_id = azurerm_private_dns_zone.private_dns_zone.id

  role_based_access_control_enabled = false

  ingress_application_gateway {
    gateway_name = "${var.project_name}KubernetesIngress"
    subnet_id    = var.gateway_subnet_id
  }

  http_application_routing_enabled = true

  azure_policy_enabled = false

  network_profile {
    network_plugin     = "azure"
    network_policy     = "azure"
    load_balancer_sku  = "standard"
    service_cidr       = "10.2.0.0/24"
    docker_bridge_cidr = "172.17.0.1/16"
    dns_service_ip     = "10.2.0.10"
  }

  private_cluster_enabled = true


  default_node_pool {
    name                 = "default"
    node_count           = 1
    vm_size              = "Standard_D2_v2"
    vnet_subnet_id       = var.aks_subnet_id
    enable_auto_scaling  = var.enable_auto_scaling
    min_count            = var.min_node_count
    max_count            = var.max_node_count
    orchestrator_version = var.kubernetes_version
  }

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.aks_identity.id]
  }

  #  lifecycle {
  #    ignore_changes = [kubernetes_version]
  #  }
}
