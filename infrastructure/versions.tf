terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "2.50.0"
    }

    template = {
      source = "hashicorp/template"
    }
  }
  # required_version = "0.15.0"
  required_version = "0.15.5"
}

provider "azurerm" {
  features {}
}
