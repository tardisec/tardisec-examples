# Cloudflare Transform Rule (Terraform) × tardisec

The synced header map applied at the Cloudflare edge, on any zone you control, whatever runs
behind it. No application code, no Worker.

| File | What it does |
| --- | --- |
| `cloudflare.tf` | A `http_response_headers_transform` ruleset built from `.tardisec.json` |
| `.tardisec.cloudflare-terraform.tf` | Synced. The same ruleset as the API emits it, header values inline |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

Reading the manifest at plan time is what keeps the rule and the sync in step: no generated
HCL to review, and `terraform plan` is the diff. Set `cloudflare_zone_id` and apply. The
dashboard's rule builder writes the same thing by hand.

Cloudflare provider >= 5, where `rules` and `action_parameters` are assigned attributes and
`headers` is a map keyed by header name. Provider v4 wanted repeated blocks with their own
`name` field and will reject both files here; upgrade with `cloudflare tf-migrate` rather than
translating them back.

Terraform skips files whose names begin with a dot, so the synced `.tf` sits here as the
reference copy and never loads. Rename it to `tardisec.tf` to use it directly, and drop
`cloudflare.tf` if you do, since both declare `cloudflare_ruleset.tardisec_headers`; the
synced copy expects `var.cloudflare_zone_id` to be declared somewhere else in the module.

Headers are `set`, not appended, so the origin's own weaker `X-Frame-Options` or CSP loses to
the synced one. That is the opposite of the app-code examples here, which defer to a header the
app already set.

A Transform Rule cannot serve a file, so it does nothing for domain verification. Verify over
DNS, or use [cloudflare-workers-tardisec-examples](../cloudflare-workers-tardisec-examples),
which serves `/.well-known/tardisec-verification.txt` as well as setting the headers. Running
Cloudflare Pages? [cloudflare-pages-functions-tardisec-examples](../cloudflare-pages-functions-tardisec-examples)
and [cloudflare-tardisec-examples](../cloudflare-tardisec-examples) apply the map inside the
project instead.

## Keeping the files current

Copy `.github/workflows/tardisec.yml` to your repo root and set `domain`. It runs weekly,
authenticates with the workflow's OIDC token (no stored secret), and opens a PR only when one
of the files actually changed. Merging it is what changes the headers, so apply after.

Other providers, `path` / `format` / `pull-request` inputs, and the multi-directory recipe
for `.well-known/`: [tardisec/tardisec-integration-github-action](https://github.com/tardisec/tardisec-integration-github-action).
Not on GitHub? [tardisec/tardisec-integration-template](https://github.com/tardisec/tardisec-integration-template)
lists every integration and the raw API.

## What the manifest carries that the rule can't apply

`.tardisec.json` also has `dns` (`TYPE` → label → values, `""` = the origin) and
`.well-known` (filename → content). Publish the DNS records in your Cloudflare zone; the
platform's own records stay untouched.

The checked-in file is generated for `example.com` with a few confirmed allow-rules; yours
differs by domain, remediation mode, and what tardisec has observed.
