resource "sparkpost_template" "reset-password" {
  content_from_email     = "{{fromEmail}}"
  content_from_name      = "{{fromName}}"
  content_subject        = "Recover password"
  name                   = "Recover password"
  options_click_tracking = true
  options_open_tracking  = true
  options_transactional  = false
  published              = true
  content_html           = file("${path.module}/templates/reset-password.html")
}

resource "sparkpost_template" "reset-password-confirmation" {
  content_from_email     = "{{fromEmail}}"
  content_from_name      = "{{fromName}}"
  content_subject        = "Confirm user"
  name                   = "Confirm user"
  options_click_tracking = true
  options_open_tracking  = true
  options_transactional  = false
  published              = true
  content_html           = file("${path.module}/templates/reset-password-confirmation.html")
}

resource "sparkpost_template" "sign-up-confirmation" {
  content_from_email     = "{{fromEmail}}"
  content_from_name      = "{{fromName}}"
  content_subject        = "Confirm user"
  name                   = "Confirm user with password"
  options_click_tracking = true
  options_open_tracking  = true
  options_transactional  = false
  published              = true
  content_html           = file("${path.module}/templates/sign-up-confirmation.html")
}
