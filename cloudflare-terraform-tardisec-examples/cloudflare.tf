# The header map as a zone Transform Rule, applied at the edge whatever the origin is.
# Reads the synced manifest, so the rule follows the sync. cloudflare provider >= 5, where
# `rules` and `action_parameters` are assigned attributes and `headers` is a map keyed by
# header name. This sets headers only: the verification file needs a route that can serve it,
# which is what the Worker example does.
variable "cloudflare_zone_id" {
  type = string
}

locals {
  tardisec_headers = jsondecode(file("${path.module}/.tardisec.json")).http.headers
}

resource "cloudflare_ruleset" "tardisec_headers" {
  zone_id = var.cloudflare_zone_id
  name    = "tardisec-headers"
  kind    = "zone"
  phase   = "http_response_headers_transform"

  rules = [{
    action      = "rewrite"
    expression  = "true"
    description = "tardisec reporting headers"
    action_parameters = {
      # set, not append: the origin's own weaker header loses to the synced one.
      headers = {
        for name, value in local.tardisec_headers : name => { operation = "set", value = value }
      }
    }
  }]
}
