# Azure Front Door Standard/Premium rule set, azurerm provider >= 5. On v3 and v4 the block is response_header_action, its fields are header_action and value, and the rule argument is spelled behavior_on_match. Terraform and OpenTofu read this file identically.
# operator is Overwrite throughout, never Append. Append concatenates onto a header the origin already sent and adds no delimiter, so an origin-supplied policy plus an appended one arrives as a single corrupt value.
# A Front Door rule takes at most 5 actions, so the header set is split across 5 rules that run in order.
# Wire the rule set to the route with cdn_frontdoor_rule_set_ids on azurerm_cdn_frontdoor_route. A rule set that is never associated applies cleanly and has no effect at all, with nothing in the portal to say so.
# The provider requires each rule to carry a depends_on naming your azurerm_cdn_frontdoor_origin_group and azurerm_cdn_frontdoor_origin. Add it before you apply.
# Rule and rule set names are alphanumeric only, which is why they carry no hyphens here.
# A rules engine action header value is capped at 640 characters and that cap is not adjustable. Permissions-Policy is omitted here. Serve it from your origin instead.
resource "azurerm_cdn_frontdoor_rule_set" "tardisec" {
  name                     = "tardisecheaders"
  cdn_frontdoor_profile_id = var.cdn_frontdoor_profile_id
}

resource "azurerm_cdn_frontdoor_rule" "tardisec1" {
  name                      = "tardisecheaders1"
  cdn_frontdoor_rule_set_id = azurerm_cdn_frontdoor_rule_set.tardisec.id
  order                     = 1
  behaviour_on_match        = "Continue"

  actions {
    modify_response_header {
      operator     = "Overwrite"
      header_name  = "Connection-Allowlist"
      header_value = "(response-origin);report-to=default"
    }

    modify_response_header {
      operator     = "Overwrite"
      header_name  = "Connection-Allowlist-Report-Only"
      header_value = "();report-to=default"
    }

    modify_response_header {
      operator     = "Overwrite"
      header_name  = "Content-Security-Policy"
      header_value = "base-uri 'none';connect-src 'self';default-src 'report-sample' 'report-sha256';font-src 'self';form-action 'self';frame-ancestors 'none';img-src 'self';manifest-src 'self';report-to default;report-uri https://5e7c9a9e-d31d-5f7a-8599-b72f466a0cae.report-to.org;require-trusted-types-for 'script';script-src-elem 'self' 'report-sample' 'report-sha256';style-src-elem 'self' 'report-sample' 'report-sha256';upgrade-insecure-requests"
    }

    modify_response_header {
      operator     = "Overwrite"
      header_name  = "Content-Security-Policy-Report-Only"
      header_value = "base-uri 'none';default-src 'report-sample' 'report-sha256';form-action 'none';frame-ancestors 'none';report-to default;report-uri https://5e7c9a9e-d31d-5f7a-8599-b72f466a0cae.report-to.org;require-trusted-types-for 'script'"
    }

    modify_response_header {
      operator     = "Overwrite"
      header_name  = "Cross-Origin-Embedder-Policy"
      header_value = "require-corp;report-to=default"
    }
  }
}

resource "azurerm_cdn_frontdoor_rule" "tardisec2" {
  name                      = "tardisecheaders2"
  cdn_frontdoor_rule_set_id = azurerm_cdn_frontdoor_rule_set.tardisec.id
  order                     = 2
  behaviour_on_match        = "Continue"

  actions {
    modify_response_header {
      operator     = "Overwrite"
      header_name  = "Cross-Origin-Opener-Policy"
      header_value = "same-origin;report-to=default"
    }

    modify_response_header {
      operator     = "Overwrite"
      header_name  = "Cross-Origin-Resource-Policy"
      header_value = "same-origin"
    }

    modify_response_header {
      operator     = "Overwrite"
      header_name  = "Document-Isolation-Policy"
      header_value = "isolate-and-require-corp;report-to=\"default\""
    }

    modify_response_header {
      operator     = "Overwrite"
      header_name  = "Document-Policy"
      header_value = "*;report-to=default"
    }

    modify_response_header {
      operator     = "Overwrite"
      header_name  = "Integrity-Policy"
      header_value = "blocked-destinations=(script style),endpoints=(default)"
    }
  }
}

resource "azurerm_cdn_frontdoor_rule" "tardisec3" {
  name                      = "tardisecheaders3"
  cdn_frontdoor_rule_set_id = azurerm_cdn_frontdoor_rule_set.tardisec.id
  order                     = 3
  behaviour_on_match        = "Continue"

  actions {
    modify_response_header {
      operator     = "Overwrite"
      header_name  = "NEL"
      header_value = "{\"failure_fraction\":1,\"include_subdomains\":true,\"max_age\":31536000,\"report_to\":\"default\",\"success_fraction\":0}"
    }

    modify_response_header {
      operator     = "Overwrite"
      header_name  = "Origin-Agent-Cluster"
      header_value = "?1"
    }

    modify_response_header {
      operator     = "Overwrite"
      header_name  = "Referrer-Policy"
      header_value = "no-referrer"
    }

    modify_response_header {
      operator     = "Overwrite"
      header_name  = "Report-To"
      header_value = "{\"endpoints\":[{\"url\":\"https://5e7c9a9e-d31d-5f7a-8599-b72f466a0cae.report-to.org\"}],\"group\":\"default\",\"include_subdomains\":true,\"max_age\":31536000}"
    }

    modify_response_header {
      operator     = "Overwrite"
      header_name  = "Reporting-Endpoints"
      header_value = "default=\"https://5e7c9a9e-d31d-5f7a-8599-b72f466a0cae.report-to.org\""
    }
  }
}

resource "azurerm_cdn_frontdoor_rule" "tardisec4" {
  name                      = "tardisecheaders4"
  cdn_frontdoor_rule_set_id = azurerm_cdn_frontdoor_rule_set.tardisec.id
  order                     = 4
  behaviour_on_match        = "Continue"

  actions {
    modify_response_header {
      operator     = "Overwrite"
      header_name  = "Require-Document-Policy"
      header_value = "*;report-to=default"
    }

    modify_response_header {
      operator     = "Overwrite"
      header_name  = "Scripting-Policy"
      header_value = "eval=blocked, report-to=default"
    }

    modify_response_header {
      operator     = "Overwrite"
      header_name  = "Strict-Transport-Security"
      header_value = "max-age=31536000;includeSubDomains;preload"
    }

    modify_response_header {
      operator     = "Overwrite"
      header_name  = "X-Content-Type-Options"
      header_value = "nosniff"
    }

    modify_response_header {
      operator     = "Overwrite"
      header_name  = "X-DNS-Prefetch-Control"
      header_value = "off"
    }
  }
}

resource "azurerm_cdn_frontdoor_rule" "tardisec5" {
  name                      = "tardisecheaders5"
  cdn_frontdoor_rule_set_id = azurerm_cdn_frontdoor_rule_set.tardisec.id
  order                     = 5
  behaviour_on_match        = "Continue"

  actions {
    modify_response_header {
      operator     = "Overwrite"
      header_name  = "X-Download-Options"
      header_value = "noopen"
    }

    modify_response_header {
      operator     = "Overwrite"
      header_name  = "X-Frame-Options"
      header_value = "DENY"
    }

    modify_response_header {
      operator     = "Overwrite"
      header_name  = "X-Permitted-Cross-Domain-Policies"
      header_value = "none"
    }
  }
}