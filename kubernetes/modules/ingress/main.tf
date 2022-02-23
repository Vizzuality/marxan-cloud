resource "kubernetes_ingress_v1" "ingress" {
  metadata {
    name      = var.project_name
    namespace = var.namespace
    annotations = {
      "kubernetes.io/ingress.class"                    = "azure/application-gateway"
      "appgw.ingress.kubernetes.io/health-probe-port"  = "3000"
      "appgw.ingress.kubernetes.io/health-probe-path"  = "/ping"
    }
  }

  spec {
    rule {
      http {
        path {
          path = "/"
          path_type = "Prefix"
          backend {
            service {
              name = "api"
              port {
                number = 3000
              }
            }
          }
        }
      }
    }
  }
}
