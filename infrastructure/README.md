# Azure Infrastructure

## Initial Setup - tfstate

The terraform state is stored in an Azure storage container. That container is created in `bootstrap.sh` and relies on some prerequisites

- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/) is installed and initialized
- Azure permissions to create a resource group, storage account, and storage container


## Initial Setup - terraform

To run `terraform init`, `terraform plan`, etc. terraform needs to authenticate with Azure. Follow [the guide](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/guides/azure_cli).