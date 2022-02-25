output "client_ip" {
  value = kubernetes_ingress_v1.ingress.status[0].load_balancer[0].ingress[0].ip
}
