resource "helm_release" "cert-manager" {
  name       = "cert-manager"
  repository = "https://charts.jetstack.io"
  chart      = "cert-manager"
  version    = "1.7.1"

  namespace = "cert-manager"

  wait             = false
  create_namespace = true

  set {
    name  = "installCRDs"
    value = "true"
  }

  set {
    name  = "startupapicheck.timeout"
    value = "5m"
  }
}


resource "kubectl_manifest" "alb_ingress_controller_main" {
  yaml_body = templatefile("${path.module}/k8s_files/01_cluster-issuer.yaml.tmpl", {
    email : var.email,
    cert_server : var.cert_server,
  })
}
