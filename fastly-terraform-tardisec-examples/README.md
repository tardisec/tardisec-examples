# Fastly (Terraform and OpenTofu) × tardisec

The synced tardisec config as response header objects on a Fastly VCL service. No application
code.

| File | What it does |
| --- | --- |
| `main.tf` | Builds the service's `header` objects from `.tardisec.json` |
| `.tardisec.fastly-terraform.tf` | Synced. The same header objects as the API emits them |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

Reading the manifest at plan time is what keeps the headers and the sync in step: no generated
HCL to review, and `terraform plan` is the diff. Identical HCL either way, so `tofu plan` works
the same. The domain and backend here are placeholders; the header objects are the part to keep.

`type = "response"` runs the header on the way back to the client, and `action = "set"`
overwrites whatever the origin sent. `source` is VCL rather than a bare string, so the value has
to arrive quoted: `jsonencode` does the quoting and the escaping, which matters for a CSP full
of single quotes.

Every apply creates a new service version and activates it. That is Fastly's model, not
something this configuration chooses, so expect a version bump per header change and keep
`force_destroy` in mind before pointing this at a service you did not create.

Terraform skips files whose names begin with a dot, so the synced `.tf` sits here as the
reference copy and never loads.

## Keeping the files current

Copy `.github/workflows/tardisec.yml` to your repo root and set `domain`. It runs weekly,
authenticates with the workflow's OIDC token (no stored secret), and opens a PR only when one of
the files actually changed. Merging it is what changes the headers, so apply after.

Other providers, `path` / `format` / `pull-request` inputs, and the multi-directory recipe
for `.well-known/`: [tardisec/tardisec-integration-github-action](https://github.com/tardisec/tardisec-integration-github-action).
Not on GitHub? [tardisec/tardisec-integration-template](https://github.com/tardisec/tardisec-integration-template)
lists every integration and the raw API.

## What the manifest carries that the service can't apply

`.tardisec.json` also has `dns` (`TYPE` → label → values, `""` = the origin) and
`.well-known` (filename → content). Publish the DNS records in your zone and serve
`.well-known/tardisec-verification.txt` verbatim from the origin behind Fastly, or with a
synthetic response if the origin has no route for it.

The synced files are generated for `example.com` with a few confirmed allow-rules; yours differ
by domain, remediation mode, and what tardisec has observed.
