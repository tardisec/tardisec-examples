# Azure Front Door (Terraform and OpenTofu) × tardisec

The synced tardisec config as a Front Door rule set that overwrites response headers at the
edge. No application code.

| File | What it does |
| --- | --- |
| `main.tf` | Builds the rule set and its header actions from `.tardisec.json` |
| `.tardisec.frontdoor-terraform.tf` | Synced. The same rule set as the API emits it |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

Reading the manifest at plan time is what keeps the headers and the sync in step: no generated
HCL to review, and `terraform plan` is the diff. Identical HCL either way, so `tofu plan` works
the same. Set `cdn_frontdoor_profile_id` and apply. Front Door Standard or Premium; Classic has
a different resource set entirely.

## The rule set does nothing until a route points at it

This is the trap, and it costs people an afternoon: a rule set that is not referenced by a route
applies cleanly, reports no error, and changes no header. Nothing in the plan, the apply or the
portal flags it.

```hcl
resource "azurerm_cdn_frontdoor_route" "site" {
  cdn_frontdoor_rule_set_ids = [azurerm_cdn_frontdoor_rule_set.tardisec.id]
}
```

Add that to the route you already have, then verify with `curl -sI https://example.com` rather
than by reading the portal.

`operator = "Overwrite"` on each `modify_response_header` means Front Door wins over whatever the
origin sent. Switch to `Append` only for a header where two values are meaningful, which for this
map is none of them. A rule with no `conditions` block matches every request, and
`behaviour_on_match = "Continue"` lets your other rules still run. That spelling is the
provider's, British, and it is a common five-minute mistake.

Terraform skips files whose names begin with a dot, so the synced `.tf` sits here as the
reference copy and never loads. Rename it to `tardisec.tf` to use it directly, and drop `main.tf`
if you do, since both declare the same rule set.

## Keeping the files current

Copy `.github/workflows/tardisec.yml` to your repo root and set `domain`. It runs weekly,
authenticates with the workflow's OIDC token (no stored secret), and opens a PR only when one of
the files actually changed. Merging it is what changes the headers, so apply after.

Other providers, `path` / `format` / `pull-request` inputs, and the multi-directory recipe
for `.well-known/`: [tardisec/tardisec-integration-github-action](https://github.com/tardisec/tardisec-integration-github-action).
Not on GitHub? [tardisec/tardisec-integration-template](https://github.com/tardisec/tardisec-integration-template)
lists every integration and the raw API.

## What the manifest carries that the rule set can't apply

`.tardisec.json` also has `dns` (`TYPE` → label → values, `""` = the origin) and
`.well-known` (filename → content). Publish the DNS records in your zone and serve
`.well-known/tardisec-verification.txt` verbatim from the origin behind Front Door.

The synced files are generated for `example.com` with a few confirmed allow-rules; yours differ
by domain, remediation mode, and what tardisec has observed.
