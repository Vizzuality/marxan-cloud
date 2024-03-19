terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.32.0"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "2.30.0"
    }

    template = {
      source = "hashicorp/template"
    }

    github = {
      source  = "integrations/github"
      version = "6.1.0"
    }
  }
  required_version = "1.4.5"
}

provider "azurerm" {
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
