# IDs of subnets provisioned.
output "network_subnet_ids" {
  description = "IDs of subnets provisioned."
  value       = "${concat(azurerm_subnet.private_subnet.*.id, azurerm_subnet.public_subnet.*.id)}"
}

# Prefixes of virtual networks provisioned.
output "network_subnet_prefixes" {
  description = "Prefixes of virtual networks provisioned."
  value       = "${concat(azurerm_subnet.public_subnet.*.address_prefix, azurerm_subnet.private_subnet.*.address_prefix)}"
}

# IDs of network security groups provisioned.
output "network_security_group_ids" {
  description = "IDs of network security groups provisioned."
  value       = "${concat(azurerm_network_security_group.public_nsg.*.id, azurerm_network_security_group.private_nsg.*.id)}"
}

# IDs of public IP addresses provisioned.
output "public_ip_ids" {
  description = "IDs of public IP addresses provisioned."
  value       = "${azurerm_public_ip.public_ip.*.id}"
}

# IP addresses of public IP addresses provisioned.
output "public_ip_addresses" {
  description = "IP addresses of public IP addresses provisioned."
  value       = "${azurerm_public_ip.public_ip.*.ip_address}"
}

# FQDNs of public IP addresses provisioned.
output "public_ip_dns_names" {
  description = "FQDNs of public IP addresses provisioned."
  value       = "${azurerm_public_ip.public_ip.*.fqdn}"
}
