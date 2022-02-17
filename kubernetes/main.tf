terraform {
  backend "azurerm" {
    resource_group_name  = "marxan"        // var.project_name
    storage_account_name = "marxan"        // var.project_name
    container_name       = "marxantfstate" // ${var.project_name}tfstate
    key                  = "kubernetes.tfstate"
  }
}

data "azurerm_resource_group" "resource_group" {
  name = var.project_name
}

data "azurerm_subscription" "subscription" {
}

data "terraform_remote_state" "core" {
  backend = "azurerm"
  config = {
    resource_group_name  = "marxan"        // var.project_name
    storage_account_name = "marxan"        // var.project_name
    container_name       = "marxantfstate" // ${var.project_name}tfstate
    key                  = "infrastructure.tfstate"
  }
}

data "azurerm_kubernetes_cluster" "k8s_cluster" {
  name                = data.terraform_remote_state.core.outputs.aks_cluster_name
  resource_group_name = data.azurerm_resource_group.resource_group.name
}

locals {
  k8s_host                   = "${trim(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.host, "443")}${var.port}"
  k8s_client_certificate     = base64decode(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.client_certificate)
  k8s_client_key             = base64decode(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.client_key)
  k8s_cluster_ca_certificate = base64decode(data.azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.cluster_ca_certificate)
}

module "k8s_namespaces" {
  source                     = "./modules/k8s_namespaces"
  namespaces                 = ["production", "staging"]
  k8s_host                   = local.k8s_host
  k8s_client_certificate     = local.k8s_client_certificate
  k8s_client_key             = local.k8s_client_key
  k8s_cluster_ca_certificate = local.k8s_cluster_ca_certificate
}

#module "k8s_database" {
#  source           = "./modules/database"
#  cluster_endpoint = "${data.terraform_remote_state.core.outputs.eks_cluster.endpoint}:4433"
#  cluster_ca       = data.terraform_remote_state.core.outputs.eks_cluster.certificate_authority.0.data
#  cluster_name     = data.terraform_remote_state.core.outputs.eks_cluster.name
#}
