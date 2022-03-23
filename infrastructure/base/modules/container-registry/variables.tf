variable "container_registry_name" {
  type        = string
  description = "Name for the Azure CR. Must be globally unique"
}

variable "resource_group" {
  description = "The Azure resource group where the module will create its resources"
}

variable "github_org" {
  type        = string
  description = "Name of the Github org where the project is hosted"
}

variable "github_repo" {
  type        = string
  description = "Name of the Github project where the source code is hosted"
}

variable "github_staging_branch" {
  type        = string
  description = "Name of the Github branch for the staging deployment code"
}

variable "github_production_branch" {
  type        = string
  description = "Name of the Github branch for the staging deployment code"
}
