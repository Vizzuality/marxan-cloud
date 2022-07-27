resource "kubernetes_service" "api_service" {
  metadata {
    name      = kubernetes_deployment.api_deployment.metadata[0].name
    namespace = var.namespace
  }
  spec {
    selector = {
      name = kubernetes_deployment.api_deployment.metadata[0].name
    }
    port {
      port        = 30001
      target_port = 3000
    }

    type = "NodePort"
  }
}

resource "kubernetes_deployment" "api_deployment" {
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

        volume {
          name = "shared-temp-data-storage"
          persistent_volume_claim {
            claim_name = var.temp_data_pvc_name
          }
        }

        volume {
          name = "shared-cloning-storage"
          persistent_volume_claim {
            claim_name = var.cloning_pvc_name
          }
        }

        container {
          image             = var.image
          image_pull_policy = "Always"
          name              = var.deployment_name

          args = ["start"]

          volume_mount {
            mount_path  = "/tmp/storage"
            name        = "shared-temp-data-storage"
          }

          volume_mount {
            mount_path  = "/opt/marxan-project-cloning"
            name        = "shared-cloning-storage"
          }

          env {
            name = "API_POSTGRES_HOST"
            value_from {
              secret_key_ref {
                name = "api"
                key  = "API_POSTGRES_HOST"
              }
            }
          }

          env {
            name = "API_POSTGRES_USER"
            value_from {
              secret_key_ref {
                name = "api"
                key  = "API_POSTGRES_USER"
              }
            }
          }

          env {
            name = "API_POSTGRES_PASSWORD"
            value_from {
              secret_key_ref {
                name = "api"
                key  = "API_POSTGRES_PASSWORD"
              }
            }
          }

          env {
            name = "API_POSTGRES_DB"
            value_from {
              secret_key_ref {
                name = "api"
                key  = "API_POSTGRES_DB"
              }
            }
          }

          env {
            name = "GEO_POSTGRES_HOST"
            value_from {
              secret_key_ref {
                name = "api"
                key  = "GEO_POSTGRES_HOST"
              }
            }
          }

          env {
            name = "GEO_POSTGRES_USER"
            value_from {
              secret_key_ref {
                name = "api"
                key  = "GEO_POSTGRES_USER"
              }
            }
          }

          env {
            name = "GEO_POSTGRES_PASSWORD"
            value_from {
              secret_key_ref {
                name = "api"
                key  = "GEO_POSTGRES_PASSWORD"
              }
            }
          }

          env {
            name = "GEO_POSTGRES_DB"
            value_from {
              secret_key_ref {
                name = "api"
                key  = "GEO_POSTGRES_DB"
              }
            }
          }

          env {
            name = "API_POSTGRES_SSL_MODE"
            value = true
          }

          env {
            name = "GEO_POSTGRES_SSL_MODE"
            value = true
          }

          env {
            name = "API_AUTH_JWT_SECRET"
            value_from {
              secret_key_ref {
                name = "api"
                key  = "API_AUTH_JWT_SECRET"
              }
            }
          }

          env {
            name  = "APPLICATION_BASE_URL"
            value = var.application_base_url
          }

          env {
            name = "API_AUTH_X_API_KEY"
            value_from {
              secret_key_ref {
                name = "api"
                key  = "API_AUTH_X_API_KEY"
              }
            }
          }

          env {
            name = "CLONING_SIGNING_SECRET"
            value_from {
              secret_key_ref {
                name = "api"
                key  = "CLONING_SIGNING_SECRET"
              }
            }
          }

          env {
            name = "SPARKPOST_APIKEY"
            value_from {
              secret_key_ref {
                name = "api"
                key  = "SPARKPOST_APIKEY"
              }
            }
          }

          env {
            name = "SPARKPOST_ORIGIN"
            value = var.sparkpost_base_url
          }

          env {
            name = "REDIS_HOST"
            value_from {
              secret_key_ref {
                name = "api"
                key  = "REDIS_HOST"
              }
            }
          }

          env {
            name = "REDIS_PASSWORD"
            value_from {
              secret_key_ref {
                name = "api"
                key  = "REDIS_PASSWORD"
              }
            }
          }

          env {
            name = "REDIS_PORT"
            value_from {
              secret_key_ref {
                name = "api"
                key  = "REDIS_PORT"
              }
            }
          }

          env {
            name  = "REDIS_USE_TLS"
            value = "true"
          }

          env {
            name  = "API_SERVICE_PORT"
            value = 3000
          }

          env {
            name  = "API_RUN_MIGRATIONS_ON_STARTUP"
            value = true
          }

          env {
            name  = "NETWORK_CORS_ORIGINS"
            value = var.network_cors_origins
          }

          env {
            name  = "NODE_CONFIG_DIR"
            value = "apps/api/config"
          }

          env {
            name  = "BACKEND_HTTP_LOGGING_MORGAN_FORMAT"
            value = var.http_logging_morgan_format
          }

          env {
            name  = "NODE_ENV"
            value = var.namespace
          }

          env {
            name  = "API_POSTGRES_LOGGING"
            value = var.api_postgres_logging
          }

          env {
            name  = "GEO_POSTGRES_MAX_CLIENTS_IN_POOL"
            value = var.postgres_geodb_max_clients_in_pool
          }

          resources {
            limits = {
              cpu    = "1"
              memory = "4Gi"
            }
            requests = {
              cpu    = "500m"
              memory = "4Gi"
            }
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
