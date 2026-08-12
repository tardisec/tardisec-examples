# RedwoodJS × tardisec

Drop-in files for wiring a RedwoodJS api side to its synced tardisec config. Copy them into
your app; the `.tardisec.*` files are then maintained by the sync, not by you.

**A naming note first, because it changes what "current" means here.** The classic
React + GraphQL + Prisma framework was renamed Redwood GraphQL and its maintainers wound
down development on it (see the `redwoodjs/graphql` release notes from October 2024); the
actively maintained continuation of that same architecture is the community fork
[CedarJS](https://cedarjs.com). The team's own new project, RedwoodSDK, is a different,
Cloudflare-native React Server Components framework and not a drop-in replacement. This
example targets the classic architecture, since that's what people mean by "RedwoodJS" and
what CedarJS keeps working: everything below applies to a CedarJS app too, swapping
`@redwoodjs/*` package names for `@cedarjs/*`.

| File | What it does |
| --- | --- |
| `api/src/lib/tardisecMiddleware.ts` | The middleware: the Fastify `onSend` hook |
| `api/src/server.ts` | Wiring only. Reads the manifest and registers the hook |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

`api/src/server.ts` is Redwood's documented escape hatch for the underlying Fastify instance
([Server File docs](https://docs.redwoodjs.com/docs/server-file/)): `createServer` accepts a
`configureApiServer(server)` option that runs before Redwood's own API plugin registers,
which is the only supported place to reach the raw instance. From there this registers a
Fastify `onSend` hook, the standard way to set headers on every response regardless of route:
it runs after a function or GraphQL resolver builds its response but before it goes over the
wire, so it covers thrown errors and GraphQL error payloads too, not only the 200 path.

The manifest is read once at process start with `fs.readFileSync`, resolved against
`getPaths().base` from `@redwoodjs/project-config` rather than `__dirname` or `process.cwd()`.
The compiled server file runs from `api/dist`, not `api/src`, so `__dirname` points at the
wrong directory after a build, and `process.cwd()` depends on how the process happened to be
launched; `getPaths().base` is Redwood's own answer to "where is the project root" and is
correct either way. The `FastifyInstance` type comes from `fastify` itself, already resolvable
as a dependency of `@redwoodjs/api-server`; add it to your own `devDependencies` explicitly if
your package manager doesn't hoist it.

**The web side is a different story, and this is the part worth being precise about.** In
Redwood's default and most common deploy shape, serverless functions plus a CDN (Netlify,
Vercel, or the AWS/Baremetal equivalents), the web side is a Vite-built static SPA with no
app code running per request; `configureApiServer` only ever touches the api side's Fastify
instance. There is no `redwood.toml` setting for response headers either. That means code
cannot apply headers to the web side in that deploy shape, full stop: use your host's own
mechanism instead, the `.tardisec.nginx.conf` / `.tardisec.caddyfile` / `.tardisec.vercel.json`
/ `.tardisec.cloudfront-cloudformation.json` snippets referenced in the root of this repo, or
your host's `_headers` equivalent.

The likely exception is Redwood's self-hosted "baremetal" deploy: historically `rw serve`
(being renamed `cedarjs serve`) ran the web and api sides in one Fastify process, and where
that holds this same `onSend` hook covers the static web responses too. Treat that as
unconfirmed on current releases, because it was checked against 3.x-era docs plus the current
package layout rather than a current authoritative page. Verify it on your own deploy with
`curl -I` against a plain web-side URL, not an api route, before relying on this file for both
sides.

No build-time CSP hashing, so the enforce CSP ships as-is. Fine for the API side, but any HTML
the web side serves with an inline `<script>` needs a nonce, which this setup cannot inject
either, for the same reason it cannot set headers on plain static files.

## Keeping the files current

Copy `.github/workflows/tardisec.yml` to your repo root and set `domain`. It runs weekly,
authenticates with the workflow's OIDC token (no stored secret), and opens a PR only when
the file actually changed.

Other providers, `path` / `format` / `pull-request` inputs, and the multi-directory recipe
for `.well-known/`: [tardisec/tardisec-integration-github-action](https://github.com/tardisec/tardisec-integration-github-action).
Not on GitHub? [tardisec/tardisec-integration-template](https://github.com/tardisec/tardisec-integration-template)
lists every integration and the raw API.

## What the manifest carries that code can't apply

`.tardisec.json` also has `dns` (`TYPE` → label → values, `""` = the origin) and
`.well-known` (filename → content). Publish the DNS records in your zone and serve
`.well-known/tardisec-verification.txt` verbatim, sync it straight into your static
directory with a second action block.

The checked-in files are generated for `example.com` with a few confirmed allow-rules;
yours differ by domain, remediation mode, and what tardisec has observed.
