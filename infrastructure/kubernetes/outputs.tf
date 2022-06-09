output "production_client_url" {
  value = "https://${var.domain}"
}

output "production_api_url" {
  value = "https://api.${var.domain}"
}

output "staging_client_url" {
  value = "https://staging.${var.domain}"
}

output "staging_api_url" {
  value = "https://api.staging.${var.domain}"
}

output current_client_config {
    value = module.key_vault_staging.current_client_config
}
