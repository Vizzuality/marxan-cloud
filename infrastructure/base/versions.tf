terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.13.0"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "2.17.0"
    }

    template = {
      source = "hashicorp/template"
    }
  }
  required_version = "1.2.4"
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = true
    }
  }
}
