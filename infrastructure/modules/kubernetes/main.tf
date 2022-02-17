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
  scope                = var.resource_group.id
  role_definition_name = "Contributor"
  principal_id         = azurerm_user_assigned_identity.aks_identity.principal_id
  skip_service_principal_aad_check = true
}

resource "azurerm_role_assignment" "private_dns_zone_reader" {
  scope                = azurerm_private_dns_zone.private_dns_zone.id
  role_definition_name = "Private DNS Zone Contributor"
  principal_id         = azurerm_user_assigned_identity.aks_identity.principal_id
  skip_service_principal_aad_check = true
}

resource "azurerm_role_assignment" "key_vault_reader" {
  scope                = var.resource_group.id
  role_definition_name = "Key Vault Reader"
  principal_id         = azurerm_user_assigned_identity.aks_identity.principal_id
  skip_service_principal_aad_check = true
}

resource "azurerm_private_dns_zone" "private_dns_zone" {
  name                = "${var.project_name}.privatelink.westeurope.azmk8s.io"
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
  name                = var.project_name
  location            = var.resource_group.location
  resource_group_name = var.resource_group.name
  dns_prefix          = var.project_name
  kubernetes_version = var.kubernetes_version

  private_dns_zone_id = azurerm_private_dns_zone.private_dns_zone.id

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
    name       = "default"
    node_count = 1
    vm_size    = "Standard_D2_v2"
    vnet_subnet_id = var.aks_subnet_id
  }

  identity {
    type = "UserAssigned"
    user_assigned_identity_id = azurerm_user_assigned_identity.aks_identity.id
  }
}
