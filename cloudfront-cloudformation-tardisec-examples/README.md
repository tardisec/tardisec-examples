# AWS CloudFront (CloudFormation) × tardisec

The synced tardisec config as a CloudFormation response headers policy, for a distribution in
front of S3, a Lambda function URL, an ALB, or any custom origin. No application code.

| File | What it does |
| --- | --- |
| `.tardisec.cloudfront-cloudformation.json` | Synced. A whole `AWS::CloudFront::ResponseHeadersPolicy` resource |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

Give the resource a logical id under `Resources:` and point the behavior's
`ResponseHeadersPolicyId` at it. Deploy it as it comes: the split below is already applied, and
the resource carries a `Comment` summarising it. On Terraform and OpenTofu, Pulumi or CDK
instead? Three sibling directories build the same policy.

## How the map is split

The header map is bigger than a response headers policy can hold, so the served resource splits
it:

- The six headers CloudFront gives a dedicated field (`Content-Security-Policy`,
  `Referrer-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`,
  `X-Frame-Options`, `X-XSS-Protection`) are set in `SecurityHeadersConfig` instead, with
  HSTS parsed into its structured fields rather than passed through as a string. That
  placement is the raise path: the CSP's 1783 character limit is adjustable through
  Service Quotas `L-E9944CCE` only from there.
- A custom header value is capped at 1783 characters, and AWS does not adjust that one.
  `Permissions-Policy` is 2212 characters here, so it is omitted and your origin serves it.
- **Raise Service Quotas `L-8FE99263` before your first apply.** The policy sets 18 custom
  headers against a default of 10 per policy, and the apply fails without it. The
  `SecurityHeadersConfig` entries do not count against that quota.

Whatever CloudFront drops stays with the origin, which has none of these limits. An SSR origin
already applying the map (see the framework directories here) needs nothing else; a static S3
origin cannot set headers at all, so `Permissions-Policy` is simply not served there.

`Override` is `false` throughout, so a header your origin already sets wins and CloudFront only
fills in what is missing. Flipping it to `true` makes the edge authoritative and will clobber a
fresher header from an SSR origin, including a per-request CSP carrying a nonce that no static
policy can reproduce.

## Keeping the files current

Copy `.github/workflows/tardisec.yml` to your repo root and set `domain`. It runs weekly,
authenticates with the workflow's OIDC token (no stored secret), and opens a PR only when one
of the files actually changed. Merging it is what changes the headers, so deploy after.

Other providers, `path` / `format` / `pull-request` inputs, and the multi-directory recipe
for `.well-known/`: [tardisec/tardisec-integration-github-action](https://github.com/tardisec/tardisec-integration-github-action).
Not on GitHub? [tardisec/tardisec-integration-template](https://github.com/tardisec/tardisec-integration-template)
lists every integration and the raw API.

## What the manifest carries that the policy can't apply

`.tardisec.json` also has `dns` (`TYPE` → label → values, `""` = the origin) and
`.well-known` (filename → content). Publish the DNS records in your zone and serve
`.well-known/tardisec-verification.txt` verbatim from the origin, sync it straight into the
bucket's source directory with a second action block.

The checked-in files are generated for `example.com` with a few confirmed allow-rules;
yours differ by domain, remediation mode, and what tardisec has observed.
