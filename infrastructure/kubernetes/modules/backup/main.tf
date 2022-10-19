resource "kubernetes_cron_job_v1" "cloning_storage_backup_cronjob" {
  metadata {
    name      = "cloning-storage-backup"
    namespace = var.namespace
  }

  spec {
    concurrency_policy            = "Forbid"
    schedule                      = var.schedule
    starting_deadline_seconds     = 60

    template {
      metadata {
        labels = {
          name = "cloning-storage-backup"
        }
      }

      spec {
        volume {
          name = "shared-cloning-storage"
          persistent_volume_claim {
            claim_name = var.cloning_pvc_name
          }
        }

        container {
          name    = "cloning-storage-backup-agent"
          image   = "restic/restic:0.14.0"
          command = [ "/bin/sh" ]
          args = ["-c", "restic init ; restic backup ${var.backup_source} ; restic --prune forget ${var.restic_forget_cli_parameters} ; restic check"]

          volume_mount {
            mount_path  = var.cloning_volume_mount_path
            name        = "shared-cloning-storage"
          }

          env {
            name  = "AZURE_ACCOUNT_NAME"
            value = var.azure_storage_account_name
          }

          env {
            name = "AZURE_ACCOUNT_KEY"
            value_from {
              secret_key_ref {
                name = "api"
                key  = "AZURE_STORAGE_ACCOUNT_KEY"
              }
            }
          }

          env {
            name = "RESTIC_PASSWORD"
            value_from {
              secret_key_ref {
                name = "api"
                key  = "RESTIC_PASSWORD"
              }
            }
          }

          env {
            name = "RESTIC_REPOSITORY"
            value = var.restic_repository
          }
        }

        restart_policy = "Never"
      }
    }
  }
}
