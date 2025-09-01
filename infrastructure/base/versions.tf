terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.117.1"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "2.53.1"
    }

    template = {
      source = "hashicorp/template"
    }

    github = {
      source  = "integrations/github"
      version = "6.1.0"
    }
  }
  # Tracking OpenTofu versions 🚀
  required_version = "1.9.0"
}

provider "azurerm" {
  # Skip provider registration: the user running Tofu may not have permissions
  # to register providers, and the TF provider should be able to use
  # existing ones.
  skip_provider_registration = "true"

  features {
    resource_group {
      prevent_deletion_if_contains_resources = true
    }
  }
}

# https://github.com/integrations/terraform-provider-github/issues/667#issuecomment-1182340862
provider "github" {
  #  token = var.github_token
  #  owner = "tnc-css"
}
