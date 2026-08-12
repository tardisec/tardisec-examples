# The backend service, built from the synced manifest so the served headers and .tardisec.json
# cannot drift apart. Terraform or OpenTofu, hashicorp/google >= 6.
locals {
  tardisec = jsondecode(file("${path.module}/.tardisec.json")).http.headers
}

resource "google_compute_backend_service" "site" {
  name        = "tardisec-headers"
  enable_cdn  = true
  protocol    = "HTTPS"
  port_name   = "https"
  timeout_sec = 30

  # "Name: value" strings, one per header. Cloud CDN adds them to what the backend returns, on
  # cache hits as well as misses, so a cached object carries them too.
  custom_response_headers = [
    for name, value in local.tardisec : "${name}: ${value}"
  ]

  # Your own backend goes here: backend {}, health_checks, cdn_policy, load_balancing_scheme.
}
