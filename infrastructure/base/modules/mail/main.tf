resource "azurerm_dns_cname_record" "sparkpost_cname_record" {
  zone_name           = var.dns_zone.name
  resource_group_name = var.resource_group.name
  ttl                 = 300
  name                = var.cname_name
  record              = var.cname_value

  tags = var.project_tags
}

resource "azurerm_dns_txt_record" "sparkpost_dkim_txt_record" {
  zone_name           = var.dns_zone.name
  resource_group_name = var.resource_group.name
  ttl                 = 300
  name                = var.dkim_name
  record {
    value =var.dkim_value
  }

  tags = var.project_tags
}
