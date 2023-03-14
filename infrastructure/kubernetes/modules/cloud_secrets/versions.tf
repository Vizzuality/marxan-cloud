terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.32.0"
    }

    random = {
      source  = "hashicorp/random"
      version = "3.3.2"
    }
  }
  required_version = "1.3.5"
}
