output "aks_vnet_id" {
  value = azurerm_virtual_network.aks_vnet.id
}

output "aks_vnet_name" {
  value = azurerm_virtual_network.aks_vnet.name
}

output "aks_subnet_id" {
  value = azurerm_subnet.aks_subnet.id
}

output "aks_subnet_name" {
  value = azurerm_subnet.aks_subnet.name
}

output "core_vnet_id" {
  value = azurerm_virtual_network.core_vnet.id
}

output "core_vnet_name" {
  value = azurerm_virtual_network.core_vnet.name
}

output "bastion_subnet_id" {
  value = azurerm_subnet.bastion_subnet.id
}

output "firewall_subnet_id" {
  value = azurerm_subnet.firewall_subnet.id
}

output "app_gateway_subnet_id" {
  value = azurerm_subnet.app_gateway_subnet.id
}
