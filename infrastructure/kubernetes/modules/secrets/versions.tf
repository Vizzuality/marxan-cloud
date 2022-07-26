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

    random = {
      source  = "hashicorp/random"
      version = "3.3.2"
    }
  }
  required_version = "1.2.4"
}
