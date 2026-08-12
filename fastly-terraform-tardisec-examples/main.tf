# The service, built from the synced manifest so the served headers and .tardisec.json cannot
# drift apart. Terraform or OpenTofu, fastly/fastly >= 5.
locals {
  tardisec = jsondecode(file("${path.module}/.tardisec.json")).http.headers
}

resource "fastly_service_vcl" "site" {
  name = "tardisec-headers"

  domain {
    name = "example.com"
  }

  backend {
    name              = "origin"
    address           = "origin.example.com"
    port              = 443
    use_ssl           = true
    ssl_cert_hostname = "origin.example.com"
  }

  # One header object per manifest entry. type "response" with action "set" runs on the way back
  # to the client and overwrites whatever the origin sent. `source` is VCL, not a bare string, so
  # the value has to arrive quoted; jsonencode does the quoting and the escaping.
  dynamic "header" {
    for_each = local.tardisec
    content {
      name        = header.key
      type        = "response"
      action      = "set"
      destination = "http.${header.key}"
      source      = jsonencode(header.value)
    }
  }

  force_destroy = true
}
