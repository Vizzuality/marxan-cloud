locals {
  fqdn = (var.domain_prefix == null ? var.domain : "${var.domain_prefix}.${var.domain}")
}


resource "kubernetes_ingress_v1" "ingress" {
  metadata {
    name        = "${var.project_name}-${var.namespace}"
    namespace   = var.namespace
    annotations = {
      "kubernetes.io/ingress.class"                   = "azure/application-gateway"
      "appgw.ingress.kubernetes.io/health-probe-port" = "3000"
      "appgw.ingress.kubernetes.io/health-probe-path" = "/"
      "appgw.ingress.kubernetes.io/ssl-redirect"      = "true"
      "cert-manager.io/cluster-issuer"                = "letsencrypt"
      "cert-manager.io/acme-challenge-type"           = "http01"
    }
  }

  spec {
    tls {
      hosts       = [local.fqdn]
      secret_name = "${var.project_name}-${var.namespace}-ingress-tls-secret"
    }
    rule {
      host = local.fqdn
      http {
        path {
          path      = "/"
          path_type = "Prefix"
          backend {
            service {
              name = "client"
              port {
                number = 3000
              }
            }
          }
        }
      }
    }

    rule {
      host = local.fqdn
      http {
        path {
          path      = "/api"
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


resource "azurerm_dns_a_record" "app_dns_record" {
  name                = coalesce(var.domain_prefix, "@")
  zone_name           = var.dns_zone.name
  resource_group_name = var.resource_group.name
  ttl                 = 300
  records             = [kubernetes_ingress_v1.ingress.status[0].load_balancer[0].ingress[0].ip]
}
