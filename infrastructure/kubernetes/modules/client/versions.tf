terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.16.0"
    }
  }
  required_version = "1.3.5"
}
