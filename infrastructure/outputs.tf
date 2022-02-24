output "client_certificate" {
  value = module.kubernetes.client_certificate
}

output "aks_cluster_name" {
  value       = module.kubernetes.cluster_name
  description = "AKS cluster name"
}

output "kube_config" {
  value = module.kubernetes.kube_config

  sensitive = true
}

output "azurerm_container_registry_login_server" {
  value = module.container_registry.azurerm_container_registry_login_server
}

output "azuread_application_password" {
  value = module.container_registry.azuread_application_password
}

output "azure_client_id" {
  value = module.container_registry.azure_client_id
}

output "azure_tenant_id" {
  value = data.azurerm_subscription.subscription.tenant_id
}

output "azure_subscription_id" {
  value = data.azurerm_subscription.subscription.subscription_id
}

output "bastion_public_ip" {
  value = module.bastion.bastion_public_ip
}

output "redis_url" {
  value = module.redis.redis_url
}

output "redis_password" {
  value     = module.redis.redis_password
  sensitive = true
}

output "redis_port" {
  value     = module.redis.redis_port
}
