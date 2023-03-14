output "api_auth_jwt_secret" {
  value = local.api_auth_jwt_secret
}

output "x_auth_api_key" {
  value = local.x_auth_api_key
}

output "cloning_signing_secret" {
  value = local.cloning_signing_secret
}

output "cloning_storage_backup_restic_password" {
  value = local.cloning_storage_backup_restic_password
}
