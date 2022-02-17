output "bastion_public_ip" {
  value = azurerm_linux_virtual_machine.bastion.public_ip_address
}
