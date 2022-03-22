resource "kubernetes_service" "client_service" {
  metadata {
    name      = kubernetes_deployment.client_deployment.metadata[0].name
    namespace = var.namespace
  }
  spec {
    selector = {
      name = kubernetes_deployment.client_deployment.metadata[0].name
    }
    port {
      port        = 30004
      target_port = 3000
    }

    type = "NodePort"
  }
}

resource "kubernetes_deployment" "client_deployment" {
  metadata {
    name      = var.deployment_name
    namespace = var.namespace
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        name = var.deployment_name
      }
    }

    template {
      metadata {
        labels = {
          name = var.deployment_name
        }
      }

      spec {
        affinity {
          node_affinity {
            required_during_scheduling_ignored_during_execution {
              node_selector_term {
                match_expressions {
                  key      = "type"
                  values   = ["app"]
                  operator = "In"
                }
              }
            }
          }
        }
        container {
          image             = var.image
          image_pull_policy = "Always"
          name              = var.deployment_name

          args = ["start:prod"]

          resources {
            limits = {
              cpu    = "1"
              memory = "1Gi"
            }
            requests = {
              cpu    = "500m"
              memory = "512Mi"
            }
          }

          env {
            name  = "NEXTAUTH_URL"
            value = var.site_url
          }

          env {
            name  = "NEXT_PUBLIC_API_URL"
            value = var.api_url
          }

          liveness_probe {
            http_get {
              path   = "/api/ping"
              port   = 3000
              scheme = "HTTP"
            }

            success_threshold     = 1
            timeout_seconds       = 5
            initial_delay_seconds = 15
            period_seconds        = 15
          }

          readiness_probe {
            http_get {
              path   = "/api/ping"
              port   = 3000
              scheme = "HTTP"
            }

            success_threshold     = 1
            timeout_seconds       = 5
            initial_delay_seconds = 30
            period_seconds        = 15
          }
        }
      }
    }
  }
}


