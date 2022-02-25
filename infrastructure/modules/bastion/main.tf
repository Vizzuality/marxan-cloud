###
# Bastion host
###
# Create a public IP address for bastion host VM in public subnet.
resource "azurerm_public_ip" "public_ip" {
  name                = "${var.project_name}-ip"
  location            = var.resource_group.location
  resource_group_name = var.resource_group.name
  allocation_method   = "Dynamic"
}


resource "azurerm_network_interface" "bastion_nic" {
  name                = "bastion-nic"
  location            = var.resource_group.location
  resource_group_name = var.resource_group.name

  ip_configuration {
    name                          = "${var.project_name}-bstn-nic-cfg"
    subnet_id                     = var.bastion_subnet_id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.public_ip.id
  }
}

locals {
  admin_user = "ubuntu"
}

resource "azurerm_linux_virtual_machine" "bastion" {
  name                = "bastion"
  resource_group_name = var.resource_group.name
  location            = var.resource_group.location
  size                = var.bastion_host_size
  admin_username      = local.admin_user
  network_interface_ids = [
    azurerm_network_interface.bastion_nic.id,
  ]

  disable_password_authentication = true

  dynamic "admin_ssh_key" {
    for_each = var.bastion_ssh_public_keys
    content {
      username   = local.admin_user
      public_key = admin_ssh_key.value.key
    }
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-focal"
    sku       = "20_04-lts"
    version   = "latest"
  }
}

resource "azurerm_dns_a_record" "bastion_dns_record" {
  name                = "bastion"
  zone_name           = var.dns_zone.name
  resource_group_name = var.resource_group.name
  ttl                 = 300
  records             = [azurerm_linux_virtual_machine.bastion.public_ip_address]
}
