#output "client_certificate" {
#  value = module.kubernetes.client_certificate
#}
#
#output "kube_config" {
#  value = module.kubernetes.kube_config
#
#  sensitive = true
#}

#output "azuread_application" {
#  value = module.container_registry.azuread_application
#}
#
#output "azuread_service_principal" {
#  value = module.container_registry.azuread_service_principal
#}


output "azure_client_id" {
  value = module.container_registry.azure_client_id
}

output "azure_tenant_id" {
  value = data.azurerm_subscription.subscription.tenant_id
}

output "azure_subscription_id" {
  value = data.azurerm_subscription.subscription.subscription_id
}
