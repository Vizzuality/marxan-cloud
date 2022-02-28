output "client_certificate" {
  value = module.kubernetes.client_certificate
  sensitive = true
}

output "k8s_cluster_name" {
  value       = module.kubernetes.cluster_name
  description = "AKS cluster name"
}

output "k8s_cluster_hostname" {
  value       = module.kubernetes.cluster_hostname
  description = "AKS cluster hostname"
}

output "kube_config" {
  value = module.kubernetes.kube_config
  sensitive = true
}

output "container_registry_hostname" {
  value = module.container_registry.azurerm_container_registry_login_server
}

output "container_registry_password" {
  value = module.container_registry.azuread_application_password
  sensitive = true
}

output "container_registry_client_id" {
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

output "bastion_hostname" {
  value = module.bastion.bastion_hostname
}

output "redis_hostname" {
  value = module.redis.redis_url
}

output "redis_port" {
  value     = module.redis.redis_port
}

output "redis_password" {
  value     = module.redis.redis_password
  sensitive = true
}

output "dns_zone_name" {
  value     = module.dns.dns_zone.name
}
