output "bastion_public_ip" {
  value = azurerm_linux_virtual_machine.bastion.public_ip_address
}

output "bastion_hostname" {
  value = trimsuffix(azurerm_dns_a_record.bastion_dns_record.fqdn, ".")
}

output "bastion_user" {
  value = "ubuntu"
}

output "bastion_private_key" {
  value     = tls_private_key.ssh_private_key.private_key_openssh
  sensitive = true
}
