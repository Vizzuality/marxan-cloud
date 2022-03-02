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
