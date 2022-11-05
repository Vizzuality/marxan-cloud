data "azurerm_log_analytics_workspace" "log_analytics_workspace" {
  name                = var.project_name
  resource_group_name = var.resource_group.name
}

data "template_file" "configuration-frontend" {
  template = "${file("${path.module}/configuration.xml.tpl")}"
  vars     = {
    url = "https://${var.domain}"
  }
}

data "template_file" "configuration-api" {
  template = "${file("${path.module}/configuration.xml.tpl")}"
  vars     = {
    url = "https://api.${var.domain}/api/ping"
  }
}

resource "azurerm_application_insights" "application_insights" {
  name                = "${var.project_name}-${var.namespace}"
  location            = var.location
  resource_group_name = var.resource_group.name
  application_type    = "web"
  workspace_id        = data.azurerm_log_analytics_workspace.log_analytics_workspace.id
}

resource "azurerm_application_insights_web_test" "frontend" {
  name                    = "${var.project_name}-${var.namespace}-webtest-frontend"
  location                = azurerm_application_insights.application_insights.location
  resource_group_name     = var.resource_group.name
  application_insights_id = azurerm_application_insights.application_insights.id
  kind                    = "ping"
  frequency               = var.frequency
  timeout                 = 30
  enabled                 = true
  geo_locations           = ["emea-gb-db3-azr", "us-fl-mia-edge"]

  configuration = data.template_file.configuration-frontend.rendered

  lifecycle {
    ignore_changes = [tags]
  }
}

resource "azurerm_application_insights_web_test" "api" {
  name                    = "${var.project_name}-${var.namespace}-webtest-api"
  location                = azurerm_application_insights.application_insights.location
  resource_group_name     = var.resource_group.name
  application_insights_id = azurerm_application_insights.application_insights.id
  kind                    = "ping"
  frequency               = var.frequency
  timeout                 = 30
  enabled                 = true
  geo_locations           = ["emea-gb-db3-azr", "us-fl-mia-edge"]

  configuration = data.template_file.configuration-api.rendered

  lifecycle {
    ignore_changes = [tags]
  }
}

resource "azurerm_monitor_action_group" "action_group" {
  name                = "${var.project_name}-${var.namespace}"
  resource_group_name = azurerm_application_insights.application_insights.resource_group_name
  short_name          = var.project_name

  dynamic "email_receiver" {
    for_each = var.alert_email_addresses
    content {
      name                    = email_receiver.key
      email_address           = email_receiver.value
      use_common_alert_schema = true
    }
  }
}

resource "azurerm_monitor_metric_alert" "metric_alert_frontend" {
  name                = "${var.project_name}-${var.namespace}-metricalert-frontend"
  resource_group_name = azurerm_application_insights.application_insights.resource_group_name
  scopes              = [
    azurerm_application_insights_web_test.frontend.id, azurerm_application_insights.application_insights.id
  ]
  description = "PING test alert for ${var.project_name} ${var.namespace} frontend"
  severity    = 0

  application_insights_web_test_location_availability_criteria {
    web_test_id           = azurerm_application_insights_web_test.frontend.id
    component_id          = azurerm_application_insights.application_insights.id
    failed_location_count = 2
  }

  action {
    action_group_id = azurerm_monitor_action_group.action_group.id
  }
}

resource "azurerm_monitor_metric_alert" "metric_alert_api" {
  name                = "${var.project_name}-${var.namespace}-metricalert-api"
  resource_group_name = azurerm_application_insights.application_insights.resource_group_name
  scopes              = [
    azurerm_application_insights_web_test.api.id, azurerm_application_insights.application_insights.id
  ]
  description = "PING test alert for ${var.project_name} ${var.namespace} api"
  severity    = 0

  application_insights_web_test_location_availability_criteria {
    web_test_id           = azurerm_application_insights_web_test.api.id
    component_id          = azurerm_application_insights.application_insights.id
    failed_location_count = 2
  }

  action {
    action_group_id = azurerm_monitor_action_group.action_group.id
  }
}
