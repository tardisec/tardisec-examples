# Cloudflare Workers × tardisec

The escape hatch for platforms that run neither your code nor a plugin. Your domain points at
Cloudflare, Cloudflare proxies to the platform, and this Worker adds the headers the platform
will not let you set: plus the verification file it has no route for.

| Platform | Why it lands here |
| --- | --- |
| Wix | custom headers only on Wix Studio enterprise |
| Squarespace | no custom headers at all, HSTS toggle only |
| Webflow | custom headers Enterprise-only |
| Shopify (Liquid) | merchants get no header control |
| Ghost(Pro) | managed platform, no custom headers |
| Builder.io hosted pages | head-HTML injection only |
| GitHub Pages | static hosting, no response-header control |
| BigCommerce, HubSpot Content Hub | only a settable subset, this covers the rest |

Self-hosting one of these instead? Most CMS and commerce platforms have a plugin that applies
the config in-process: [tardisec/tardisec-integration-template](https://github.com/tardisec/tardisec-integration-template)
lists them. Fronting your own nginx/Apache/Caddy? Pull `.tardisec.nginx.conf` and skip the
Worker entirely.

| File | What it does |
| --- | --- |
| `src/index.js` | Serves the verification file, proxies everything else, sets the headers |
| `wrangler.jsonc` | Route so the Worker runs on the whole zone |
| `.tardisec.cloudflare-workers.js` | Synced. The API's own version of the fetch handler, with the headers inlined |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

## Setup

1. Move the domain's DNS to Cloudflare, keep the platform's record **proxied** (orange cloud)
   so requests reach the Worker. Do not delegate the domain to the platform's own nameservers
  : that hands it control of the edge and there is nowhere left to put the Worker.
2. Set `pattern` and `zone_name` in `wrangler.jsonc` to your domain, then `npx wrangler deploy`.
3. Verify the domain in tardisec over HTTP: the Worker is already serving the file.

`fetch(request)` goes to the zone's origin, which is whatever the proxied DNS record points at.
Cloudflare does not re-invoke a Worker for its own subrequest, so this does not loop.

Headers are `set`, not appended: the platform's own weak `X-Frame-Options` or CSP loses to the
synced one. That is deliberate here, and the opposite of the app-code examples, which defer to
a header the app already set.

A Transform Rule does the same thing without a Worker, if all you need is the header map and
not the verification file: [cloudflare-terraform-tardisec-examples](../cloudflare-terraform-tardisec-examples).
Running your own Cloudflare Pages project instead?
[cloudflare-pages-functions-tardisec-examples](../cloudflare-pages-functions-tardisec-examples)
and [cloudflare-tardisec-examples](../cloudflare-tardisec-examples) apply the map inside the
project.

Nothing loads `.tardisec.cloudflare-workers.js`: `wrangler.jsonc` points at `src/index.js`. The
synced copy inlines the header values instead of reading the manifest, and it does not serve the
verification file, so it is the reference, not the deployable.

## Keeping the files current

Copy `.github/workflows/tardisec.yml` to your repo root and set `domain`. It runs weekly,
authenticates with the workflow's OIDC token (no stored secret), and opens a PR only when one
of the files actually changed. Merging it is what changes the headers: redeploy the Worker after.

## What the manifest carries that the Worker can't apply

`.tardisec.json` also has `dns` (`TYPE` → label → values, `""` = the origin). Publish those
records in your Cloudflare zone; the platform's own records stay untouched.

The checked-in file is generated for `example.com` with a few confirmed allow-rules; yours
differs by domain, remediation mode, and what tardisec has observed.
