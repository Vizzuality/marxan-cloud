###
# Core VNet
###
resource "azurerm_virtual_network" "core_vnet" {
  name                = "${var.project_name}-core-vnet"
  address_space       = ["10.1.0.0/16"]
  location            = var.resource_group.location
  resource_group_name = var.resource_group.name
}

###
# Firewall subnet
###
resource "azurerm_subnet" "firewall_subnet" {
  name                      = "AzureFirewallSubnet"
  resource_group_name       = var.resource_group.name
  virtual_network_name      = azurerm_virtual_network.core_vnet.name
  address_prefixes          = ["10.1.0.0/24"]

  enforce_private_link_endpoint_network_policies = true
  enforce_private_link_service_network_policies = false
}

###
# Bastion subnet
###
resource "azurerm_subnet" "bastion_subnet" {
  name                      = "${var.project_name}-bastion-subnet"
  resource_group_name       = var.resource_group.name
  virtual_network_name      = azurerm_virtual_network.core_vnet.name
  address_prefixes          = ["10.1.1.0/24"]

  enforce_private_link_endpoint_network_policies = true
  enforce_private_link_service_network_policies = false
}

# Create network security group and SSH rule for bastion subnet.
resource "azurerm_network_security_group" "bastion_nsg" {
  name                = "${var.project_name}-bastion-nsg"
  location            = var.resource_group.location
  resource_group_name = var.resource_group.name

  # Allow SSH traffic in from Internet to public subnet.
  security_rule {
    name                       = "allow-ssh-all"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

# Associate network security group with bastion subnet.
resource "azurerm_subnet_network_security_group_association" "public_subnet_assoc" {
  subnet_id                 = azurerm_subnet.bastion_subnet.id
  network_security_group_id = azurerm_network_security_group.bastion_nsg.id
}

###
# AKS VNet
###
resource "azurerm_virtual_network" "aks_vnet" {
  name                = "${var.project_name}-aks-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = var.resource_group.location
  resource_group_name = var.resource_group.name
}


###
# AKS subnet
###
resource "azurerm_subnet" "aks_subnet" {
  name                      = "${var.project_name}-aks-subnet"
  resource_group_name       = var.resource_group.name
  virtual_network_name      = azurerm_virtual_network.aks_vnet.name
  address_prefixes          = ["10.0.8.0/21"]

  enforce_private_link_endpoint_network_policies = true
  enforce_private_link_service_network_policies = false

  service_endpoints         = [
    "Microsoft.ServiceBus",
    "Microsoft.ContainerRegistry"
  ]
}

# Create network security group and SSH rule for AKS subnet.
resource "azurerm_network_security_group" "aks_nsg" {
  name                = "${var.project_name}-aks-nsg"
  location            = var.resource_group.location
  resource_group_name = var.resource_group.name

  # Allow all outbound traffic from aks subnet to Internet.
  security_rule {
    name                       = "allow-outbound-internet-all"
    priority                   = 200
    direction                  = "Outbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

# Associate network security group with AKS subnet.
resource "azurerm_subnet_network_security_group_association" "private_subnet_assoc" {
  subnet_id                 = azurerm_subnet.aks_subnet.id
  network_security_group_id = azurerm_network_security_group.aks_nsg.id
}


###
# Peering
##
resource "azurerm_virtual_network_peering" "peering" {
  name                      = "core-to-aks"
  resource_group_name       = var.resource_group.name
  virtual_network_name      = azurerm_virtual_network.core_vnet.name
  remote_virtual_network_id = azurerm_virtual_network.aks_vnet.id
  allow_virtual_network_access = true
  allow_forwarded_traffic      = true
}

resource "azurerm_virtual_network_peering" "peering-back" {
  name                      = "aks-to-core"
  resource_group_name       = var.resource_group.name
  virtual_network_name      = azurerm_virtual_network.aks_vnet.name
  remote_virtual_network_id = azurerm_virtual_network.core_vnet.id
  allow_virtual_network_access = true
  allow_forwarded_traffic      = true
}
