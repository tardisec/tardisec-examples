# The response headers policy, built from the synced manifest so the deployed headers and
# .tardisec.json cannot drift apart. Terraform >= 1.5, hashicorp/aws >= 5.
locals {
  tardisec = jsondecode(file("${path.module}/.tardisec.json")).http.headers

  # These six have a dedicated field in security_headers_config, so they are set there rather
  # than as custom headers. That is also the only placement where the CSP length limit is
  # adjustable, via Service Quotas L-E9944CCE.
  reserved = [
    "Content-Security-Policy",
    "Referrer-Policy",
    "Strict-Transport-Security",
    "X-Content-Type-Options",
    "X-Frame-Options",
    "X-XSS-Protection",
  ]

  # A custom header value is capped at 1783 characters and there is no increase for it, so
  # anything longer is dropped here rather than failing the apply. Permissions-Policy is 2212
  # characters in this manifest; the origin serves it.
  custom = {
    for name, value in local.tardisec : name => value
    if !contains(local.reserved, name) && length(value) <= 1783
  }
}

resource "aws_cloudfront_response_headers_policy" "tardisec" {
  name = "tardisec-headers"

  custom_headers_config {
    dynamic "items" {
      for_each = local.custom
      content {
        header = items.key
        value  = items.value
        # The origin's own header wins; CloudFront only fills in what the origin did not set.
        override = false
      }
    }
  }

  security_headers_config {
    content_security_policy {
      content_security_policy = local.tardisec["Content-Security-Policy"]
      override                = false
    }
    content_type_options {
      override = false
    }
    frame_options {
      frame_option = local.tardisec["X-Frame-Options"]
      override     = false
    }
    referrer_policy {
      referrer_policy = local.tardisec["Referrer-Policy"]
      override        = false
    }
    # Parts, not a header string; they match Strict-Transport-Security in the manifest.
    strict_transport_security {
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      preload                    = true
      override                   = false
    }
  }
}

# Attach it to every behavior that serves HTML:
#
#   default_cache_behavior {
#     response_headers_policy_id = aws_cloudfront_response_headers_policy.tardisec.id
#   }
