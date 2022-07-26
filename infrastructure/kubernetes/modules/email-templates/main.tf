resource "sparkpost_template" "reset-password" {
  template_id            = "marxan-reset-password"
  content_from_email     = "no-reply@${var.domain}"
  content_from_name      = "MaPP - Marxan Mapping App"
  content_subject        = "Forgot your password?"
  name                   = "Marxan Forgot Password"
  options_click_tracking = true
  options_open_tracking  = true
  options_transactional  = false
  published              = true
  content_html           = file("${path.module}/templates/reset-password.html")
}

resource "sparkpost_template" "reset-password-confirmation" {
  template_id            = "confirmation-password-changed"
  content_from_email     = "no-reply@${var.domain}"
  content_from_name      = "MaPP - Marxan Mapping App"
  content_subject        = "Your password was updated"
  name                   = "Marxan Reset Password"
  options_click_tracking = true
  options_open_tracking  = true
  options_transactional  = false
  published              = true
  content_html           = file("${path.module}/templates/reset-password-confirmation.html")
}

resource "sparkpost_template" "sign-up-confirmation" {
  template_id            = "confirmation-account"
  content_from_email     = "no-reply@${var.domain}"
  content_from_name      = "MaPP - Marxan Mapping App"
  content_subject        = "Welcome to Marxan!"
  name                   = "Marxan Sign Up confirmation"
  options_click_tracking = true
  options_open_tracking  = true
  options_transactional  = false
  published              = true
  content_html           = file("${path.module}/templates/sign-up-confirmation.html")
}
