variable "project_name" {
  type        = string
  description = "A project name to use when naming resources."
}

variable "resource_group" {
  description = "The Azure resource group where the module will create its resources"
}

variable "location" {
  description = "Specifies the location where firewall will be deployed"
  type        = string
}

variable "frequency" {
  description = "Interval in seconds between test runs"
  default = 600
}

variable "namespace" {
  type = string
}

variable "domain" {
  description = "Domain to test"
  type = string
}

variable "alert_email_addresses" {
  description = "key-value pair of name of email receiver and their email address"
}
