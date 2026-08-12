# AWS CloudFront (Pulumi) × tardisec

Drop-in files for applying the synced tardisec config at CloudFront with Pulumi, in front of
S3, a Lambda function URL, an ALB, or any custom origin. No application code.

| File | What it does |
| --- | --- |
| `index.ts` | Builds the response headers policy from `.tardisec.json`, filtering what CloudFront will not take |
| `.tardisec.cloudfront-pulumi.ts` | Synced. The same resource as the API emits it, every header as a custom header |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

Reading the manifest at run time is what keeps the policy and the sync in step: no generated
TypeScript to review, and `pulumi preview` is the diff. `@pulumi/aws` v6+. Attach the policy to
every behavior that serves HTML. On Terraform, CloudFormation or CDK instead? Same policy, three
other directories here.

Pulumi runs the entry module its `Pulumi.yaml` names, so the synced `.ts` is the reference copy
and never runs. Paste it over `index.ts` to use it directly. Either one is deployable: both
apply the split described below.

## What CloudFront will not take

The header map is bigger than a response headers policy can hold, so `index.ts` and the synced
file both split it:

- The six headers CloudFront gives a dedicated field (`Content-Security-Policy`,
  `Referrer-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`,
  `X-Frame-Options`, `X-XSS-Protection`) are set in `securityHeadersConfig` instead, with
  HSTS parsed into its structured fields rather than passed through as a string. That
  placement is the raise path: the CSP's 1783 character limit is adjustable through
  Service Quotas `L-E9944CCE` only from there.
- A custom header value is capped at 1783 characters, and AWS does not adjust that one.
  `Permissions-Policy` is 2212 characters here, so it is omitted and your origin serves it.
- **Raise Service Quotas `L-8FE99263` before your first apply.** The policy sets 18 custom
  headers against a default of 10 per policy, and the apply fails without it. The
  `securityHeadersConfig` entries do not count against that quota.

Whatever CloudFront drops stays with the origin, which has none of these limits. An SSR origin
already applying the map (see the framework directories here) needs nothing else; a static S3
origin cannot set headers at all, so `Permissions-Policy` is simply not served there.

`override: false` throughout, so an origin that sets its own header keeps it and CloudFront
only fills in what is missing. Flipping it to `true` makes CloudFront authoritative and will
clobber a fresher header from an SSR origin.

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
