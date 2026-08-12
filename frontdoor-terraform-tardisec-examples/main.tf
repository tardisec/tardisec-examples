# The rule set, built from the synced manifest so the served headers and .tardisec.json cannot
# drift apart. Terraform or OpenTofu, hashicorp/azurerm >= 4.
variable "cdn_frontdoor_profile_id" {
  type = string
}

locals {
  tardisec = jsondecode(file("${path.module}/.tardisec.json")).http.headers
}

resource "azurerm_cdn_frontdoor_rule_set" "tardisec" {
  name                     = "tardisecheaders"
  cdn_frontdoor_profile_id = var.cdn_frontdoor_profile_id
}

resource "azurerm_cdn_frontdoor_rule" "tardisec_headers" {
  name                      = "tardisecheaders"
  cdn_frontdoor_rule_set_id = azurerm_cdn_frontdoor_rule_set.tardisec.id
  order                     = 1
  # British spelling, and the provider will tell you so if you guess the other one.
  behaviour_on_match = "Continue"

  actions {
    # Overwrite, not Append: Front Door wins over whatever the origin sent.
    dynamic "modify_response_header" {
      for_each = local.tardisec
      content {
        operator     = "Overwrite"
        header_name  = modify_response_header.key
        header_value = modify_response_header.value
      }
    }
  }
}

# The rule set does nothing until a route references it. This is the line people miss, and
# leaving it out is not an error anywhere: the apply succeeds and no header changes.
#
#   resource "azurerm_cdn_frontdoor_route" "site" {
#     cdn_frontdoor_rule_set_ids = [azurerm_cdn_frontdoor_rule_set.tardisec.id]
#   }
