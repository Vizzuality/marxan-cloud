terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "2.92.0"
    }

    template = {
      source = "hashicorp/template"
    }
  }
  required_version = "1.1.3"
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = true
    }
  }
}

resource "azurerm_resource_group" "resource_group" {
  name     = var.project_resource_group
  location = var.location
  tags = {
    Environment = "PRD-STG"
    CreatedBy   = "Eric Coffman (ecoffman@tnc.org)"
    Manager     = "Zach Ferdana (zferdana@tnc.org)"
  }
}

resource "azurerm_storage_account" "storage_account" {
  name                     = "${var.project_name}sa"
  resource_group_name      = azurerm_resource_group.resource_group.name
  location                 = azurerm_resource_group.resource_group.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  tags = {
    Environment = "PRD-STG"
    CreatedBy   = "Eric Coffman (ecoffman@tnc.org)"
    Manager     = "Zach Ferdana (zferdana@tnc.org)"
  }
}

resource "azurerm_storage_container" "storage_container_tf_state" {
  name                  = "${var.project_name}tfstate"
  storage_account_name  = azurerm_storage_account.storage_account.name
  container_access_type = "private"
}
