output "key_vault_id" {
  value       = azurerm_key_vault.key_vault.id
  description = "Azure key vault id"
}

output current_client_config {
    value = data.azurerm_client_config.current
}
