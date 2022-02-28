resource "kubernetes_namespace" "namespaces" {
  count = length(var.namespaces)

  metadata {
    name = var.namespaces[count.index]
  }
}
