output "client_certificate" {
  value = azurerm_kubernetes_cluster.k8s_cluster.kube_config.0.client_certificate
}

output "kube_config" {
  value = azurerm_kubernetes_cluster.k8s_cluster.kube_config_raw

  sensitive = true
}

output "cluster_id" {
  value = azurerm_kubernetes_cluster.k8s_cluster.id
}

output "cluster_name" {
  value = azurerm_kubernetes_cluster.k8s_cluster.name
}

output "cluster_private_fqdn" {
  value = azurerm_kubernetes_cluster.k8s_cluster.private_fqdn
}
