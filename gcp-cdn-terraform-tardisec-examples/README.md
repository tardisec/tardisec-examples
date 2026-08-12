# Google Cloud CDN (Terraform and OpenTofu) × tardisec

The synced tardisec config as custom response headers on a Cloud CDN backend service. No
application code.

| File | What it does |
| --- | --- |
| `main.tf` | Builds the backend service's `custom_response_headers` from `.tardisec.json` |
| `.tardisec.gcp-cdn-terraform.tf` | Synced. The same resource as the API emits it |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

Reading the manifest at plan time is what keeps the headers and the sync in step: no generated
HCL to review, and `terraform plan` is the diff. Identical HCL either way, so `tofu plan` works
the same.

Cloud CDN adds these on cache hits as well as misses, so a cached object carries them too. That
is the argument for putting them here rather than only at the origin: the origin never sees a
hit.

Terraform skips files whose names begin with a dot, so the synced `.tf` sits here as the
reference copy and never loads. Rename it to `tardisec.tf` to use it directly, and drop `main.tf`
if you do, since both declare `google_compute_backend_service.site`.

`custom_response_headers` takes `"Name: value"` strings, one per header, on the backend service
rather than the URL map, so a load balancer fronting several backend services needs the block on
each one that serves HTML.

## Keeping the files current

Copy `.github/workflows/tardisec.yml` to your repo root and set `domain`. It runs weekly,
authenticates with the workflow's OIDC token (no stored secret), and opens a PR only when one of
the files actually changed. Merging it is what changes the headers, so apply after.

Other providers, `path` / `format` / `pull-request` inputs, and the multi-directory recipe
for `.well-known/`: [tardisec/tardisec-integration-github-action](https://github.com/tardisec/tardisec-integration-github-action).
Not on GitHub? [tardisec/tardisec-integration-template](https://github.com/tardisec/tardisec-integration-template)
lists every integration and the raw API.

## What the manifest carries that the backend service can't apply

`.tardisec.json` also has `dns` (`TYPE` → label → values, `""` = the origin) and
`.well-known` (filename → content). Publish the DNS records in your zone and serve
`.well-known/tardisec-verification.txt` verbatim from the origin behind the load balancer.

The synced files are generated for `example.com` with a few confirmed allow-rules; yours differ
by domain, remediation mode, and what tardisec has observed.
