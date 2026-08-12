# Cloudflare Transform Rule (Pulumi) × tardisec

The synced header map applied at the Cloudflare edge with Pulumi, on any zone you control,
whatever runs behind it. No application code, no Worker.

| File | What it does |
| --- | --- |
| `index.ts` | A `http_response_headers_transform` ruleset built from `.tardisec.json` |
| `.tardisec.cloudflare-pulumi.ts` | Synced. The same ruleset as the API emits it, header values inline |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

Reading the manifest at run time is what keeps the rule and the sync in step: no generated
TypeScript to review, and `pulumi preview` is the diff. Set the zone with
`pulumi config set cloudflareZoneId <id>` and run `pulumi up`.

`@pulumi/cloudflare` v6, which carries the provider v5 rewrite: `headers` is a map keyed by
header name, not a repeated block with a `name` field. On v5 of the package the shape differs;
upgrade rather than translating this back.

Headers are `set`, not appended, so the origin's own weaker `X-Frame-Options` or CSP loses to
the synced one. That is the opposite of the app-code examples here, which defer to a header the
app already set.

Pulumi runs the entry module its `Pulumi.yaml` names, so the synced `.ts` is the reference copy
and never runs. Paste it over `index.ts` to use it directly; it inlines the header values rather
than reading the manifest, so it stays current through the sync rather than at run time.

A Transform Rule cannot serve a file, so it does nothing for domain verification. Verify over
DNS, or use [cloudflare-workers-tardisec-examples](../cloudflare-workers-tardisec-examples),
which serves `/.well-known/tardisec-verification.txt` as well as setting the headers. On
Terraform instead? [cloudflare-terraform-tardisec-examples](../cloudflare-terraform-tardisec-examples).

## Keeping the files current

Copy `.github/workflows/tardisec.yml` to your repo root and set `domain`. It runs weekly,
authenticates with the workflow's OIDC token (no stored secret), and opens a PR only when one
of the files actually changed. Merging it is what changes the headers, so deploy after.

Other providers, `path` / `format` / `pull-request` inputs, and the multi-directory recipe
for `.well-known/`: [tardisec/tardisec-integration-github-action](https://github.com/tardisec/tardisec-integration-github-action).
Not on GitHub? [tardisec/tardisec-integration-template](https://github.com/tardisec/tardisec-integration-template)
lists every integration and the raw API.

## What the manifest carries that the rule can't apply

`.tardisec.json` also has `dns` (`TYPE` → label → values, `""` = the origin) and
`.well-known` (filename → content). Publish the DNS records in your Cloudflare zone; the
platform's own records stay untouched.

The checked-in files are generated for `example.com` with a few confirmed allow-rules;
yours differ by domain, remediation mode, and what tardisec has observed.
