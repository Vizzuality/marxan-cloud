terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.13.0"
    }

    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.8.0"
    }
  }
  required_version = "1.2.4"
}
