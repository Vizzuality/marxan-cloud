output "bastion_public_ip" {
  value = azurerm_linux_virtual_machine.bastion.public_ip_address
}

output "bastion_hostname" {
  value = azurerm_dns_a_record.bastion_dns_record.fqdn
}
