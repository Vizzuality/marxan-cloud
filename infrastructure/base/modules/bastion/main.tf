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

resource "tls_private_key" "ssh_private_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

locals {
  admin_user = "ubuntu"

  cloud_init_custom_data = <<-EOF
    #cloud-config
    runcmd:
      - fallocate -l 2G /swapfile
      - chmod 600 /swapfile
      - mkswap /swapfile
      - swapon /swapfile
      - echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
  EOF
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
    for_each = concat(var.bastion_ssh_public_keys, [tls_private_key.ssh_private_key.public_key_openssh])
    content {
      username   = local.admin_user
      public_key = admin_ssh_key.value
    }
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "ubuntu-24_04-lts"
    sku       = "minimal"
    version   = "latest"
  }

  # Since the VM for this bastion host is provisioned with a very small VM size
  # by default (Standard_B1ls, with 1 vCPU core and 0.5GiB of memory), memory
  # may typically not be enough if needing to run an apt update/upgrade to pull
  # in security-fix packages, so a small swapfile should help here. This is
  # created via cloud-init
  # (https://learn.microsoft.com/en-us/azure/virtual-machines/linux/tutorial-automate-vm-deployment)
  custom_data = base64encode(local.cloud_init_custom_data)
}

resource "azurerm_dns_a_record" "bastion_dns_record" {
  name                = "bastion"
  zone_name           = var.dns_zone.name
  resource_group_name = var.resource_group.name
  ttl                 = 300
  records             = [azurerm_linux_virtual_machine.bastion.public_ip_address]
}
