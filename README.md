# tardisec examples

Copy-in wiring for consuming a domain's synced tardisec config. Each directory is
self-contained: the framework files, the `.tardisec.*` files a real sync would write, and a
GitHub Actions workflow that keeps them current.

| Language | Folder | Framework |
| --- | --- | --- |
| JavaScript | [astro-tardisec-examples](astro-tardisec-examples) | Astro 6 |
| JavaScript | [bun-tardisec-examples](bun-tardisec-examples) | Bun.serve |
| JavaScript | [cloudflare-tardisec-examples](cloudflare-tardisec-examples) | Cloudflare Pages, static `_headers` |
| JavaScript | [cloudflare-pages-functions-tardisec-examples](cloudflare-pages-functions-tardisec-examples) | Cloudflare Pages, Functions middleware |
| JavaScript | [cloudflare-workers-tardisec-examples](cloudflare-workers-tardisec-examples) | Cloudflare Workers, closed-platform proxy |
| JavaScript | [express-tardisec-examples](express-tardisec-examples) | Express 5 |
| JavaScript | [fresh-tardisec-examples](fresh-tardisec-examples) | Deno Fresh 2 |
| JavaScript | [gatsby-tardisec-examples](gatsby-tardisec-examples) | Gatsby 5.12+ |
| JavaScript | [hono-tardisec-examples](hono-tardisec-examples) | Hono 4 |
| JavaScript | [middy-tardisec-examples](middy-tardisec-examples) | Middy 7, AWS Lambda |
| JavaScript | [netlify-tardisec-examples](netlify-tardisec-examples) | Netlify, generated `_headers` |
| JavaScript | [nextjs-tardisec-examples](nextjs-tardisec-examples) | Next.js 15 |
| JavaScript | [nuxt-tardisec-examples](nuxt-tardisec-examples) | Nuxt 3, nuxt-security |
| JavaScript | [redwoodjs-tardisec-examples](redwoodjs-tardisec-examples) | RedwoodJS / CedarJS, api side |
| JavaScript | [remix-tardisec-examples](remix-tardisec-examples) | Remix 2, React Router 7 |
| JavaScript | [solidstart-tardisec-examples](solidstart-tardisec-examples) | SolidStart 1 |
| JavaScript | [sveltekit-tardisec-examples](sveltekit-tardisec-examples) | SvelteKit 2 |
| JavaScript | [tanstack-start-tardisec-examples](tanstack-start-tardisec-examples) | TanStack Start 1 |
| JavaScript | [vite-ssr-tardisec-examples](vite-ssr-tardisec-examples) | Vite 7, `middlewareMode` |
| JavaScript | [vercel-tardisec-examples](vercel-tardisec-examples) | Vercel, `headers` in `vercel.json` |
| .NET | [aspnetcore-tardisec-examples](aspnetcore-tardisec-examples) | ASP.NET Core middleware |
| Elixir | [phoenix-tardisec-examples](phoenix-tardisec-examples) | Phoenix |
| Elixir | [plug-tardisec-examples](plug-tardisec-examples) | Plug, the interface Phoenix sits on |
| Go | [go-tardisec-examples](go-tardisec-examples) | `net/http` |
| Java | [servlet-tardisec-examples](servlet-tardisec-examples) | Jakarta Servlet filter, any container |
| Java | [spring-boot-tardisec-examples](spring-boot-tardisec-examples) | Spring Boot |
| PHP | [laravel-tardisec-examples](laravel-tardisec-examples) | Laravel 10, 11, 12 |
| PHP | [psr15-tardisec-examples](psr15-tardisec-examples) | PSR-15, for Slim, Mezzio, Laminas, Yii |
| PHP | [symfony-tardisec-examples](symfony-tardisec-examples) | Symfony |
| Python | [asgi-tardisec-examples](asgi-tardisec-examples) | ASGI, the interface the two below sit on |
| Python | [fastapi-tardisec-examples](fastapi-tardisec-examples) | FastAPI |
| Python | [starlette-tardisec-examples](starlette-tardisec-examples) | Starlette |
| Ruby | [ruby-tardisec-examples](ruby-tardisec-examples) | Rack 3 |
| Rust | [rust-tardisec-examples](rust-tardisec-examples) | axum 0.8 |
| YAML | [amplify-tardisec-examples](amplify-tardisec-examples) | AWS Amplify Hosting, `customHttp.yml` |
| YAML | [gateway-api-tardisec-examples](gateway-api-tardisec-examples) | Kubernetes Gateway API, `HTTPRoute` |
| YAML | [traefik-tardisec-examples](traefik-tardisec-examples) | Traefik v3, Kubernetes `Middleware` or Compose labels |
| JSON | [azure-swa-tardisec-examples](azure-swa-tardisec-examples) | Azure Static Web Apps, `globalHeaders` |
| JSON | [firebase-tardisec-examples](firebase-tardisec-examples) | Firebase Hosting, `headers` |
| Terraform, OpenTofu | [cloudflare-terraform-tardisec-examples](cloudflare-terraform-tardisec-examples) | Cloudflare zone, Transform Rule |
| Terraform, OpenTofu | [cloudfront-terraform-tardisec-examples](cloudfront-terraform-tardisec-examples) | AWS CloudFront, response headers policy |
| Terraform, OpenTofu | [fastly-terraform-tardisec-examples](fastly-terraform-tardisec-examples) | Fastly VCL service, response headers |
| Terraform, OpenTofu | [frontdoor-terraform-tardisec-examples](frontdoor-terraform-tardisec-examples) | Azure Front Door, rule set |
| Terraform, OpenTofu | [gcp-cdn-terraform-tardisec-examples](gcp-cdn-terraform-tardisec-examples) | Google Cloud CDN, backend service |
| CloudFormation | [cloudfront-cloudformation-tardisec-examples](cloudfront-cloudformation-tardisec-examples) | AWS CloudFront, response headers policy |
| Pulumi | [cloudflare-pulumi-tardisec-examples](cloudflare-pulumi-tardisec-examples) | Cloudflare zone, Transform Rule |
| Pulumi | [cloudfront-pulumi-tardisec-examples](cloudfront-pulumi-tardisec-examples) | AWS CloudFront, response headers policy |
| AWS CDK | [cloudfront-cdk-tardisec-examples](cloudfront-cdk-tardisec-examples) | AWS CloudFront, response headers policy |

## Two ways to apply a policy

Which files a directory carries depends on one thing: whether the framework hashes its own
inline scripts and styles at build time.

**Build-time CSP hashing.** These get a framework-specific file for the enforce CSP, because
a static header cannot carry hashes the build has not computed yet. The remaining headers
come from the manifest, and the enforce CSP is deliberately excluded from that pass so the
hash-less copy cannot intersect with the real policy and block the scripts it just hashed.

| | Enforce CSP from | Other headers from |
| --- | --- | --- |
| [SvelteKit](sveltekit-tardisec-examples) | `kit.csp` | `src/hooks.server.js` |
| [Astro](astro-tardisec-examples) | `security.csp` | `src/middleware.js` |
| [Nuxt](nuxt-tardisec-examples) | nuxt-security | `server/middleware/tardisec.ts` |
| [Gatsby](gatsby-tardisec-examples) | `gatsby-plugin-csp` | `headers` in `gatsby-config.js` |

**Header map only.** No hash automation, so the whole map, enforce CSP included, ships from
one place. Inline `<script>` needs a nonce or a move into a file; until then the manifest's
report-only policy is what tells you which sources you actually need.

| | Applied in |
| --- | --- |
| [Next.js](nextjs-tardisec-examples) | `headers()` in `next.config.js` |
| [Remix / React Router 7](remix-tardisec-examples) | `app/entry.server.tsx` |
| [Deno Fresh](fresh-tardisec-examples) | `routes/_middleware.ts` |
| [SolidStart](solidstart-tardisec-examples) | `src/middleware.ts` |
| [TanStack Start](tanstack-start-tardisec-examples) | `src/start.ts` |
| [Express](express-tardisec-examples) | `app.use` in `server.js` |
| [Hono](hono-tardisec-examples) | `app.use("*", …)` in `src/index.js` |
| [Bun](bun-tardisec-examples) | response wrapper in `server.js` |
| [Cloudflare Workers](cloudflare-workers-tardisec-examples) | `fetch` handler in `src/index.js` |
| [Cloudflare Pages Functions](cloudflare-pages-functions-tardisec-examples) | `functions/_middleware.js` |
| [Cloudflare Pages, static](cloudflare-tardisec-examples) | `_headers`, generated into the build output |
| [Netlify](netlify-tardisec-examples) | `_headers`, generated into the publish directory |
| [Vite SSR](vite-ssr-tardisec-examples) | connect middleware in `server.js` |
| [Middy (AWS Lambda)](middy-tardisec-examples) | after/onError middleware |
| [RedwoodJS / CedarJS](redwoodjs-tardisec-examples) | Fastify `onSend` in `api/src/server.ts` |
| [Go](go-tardisec-examples) | `http.Handler` wrapper in `main.go` |
| [ASGI](asgi-tardisec-examples) | `send` wrapper in `tardisec_middleware.py` |
| [Starlette](starlette-tardisec-examples) | `app.add_middleware` in `app.py` |
| [FastAPI](fastapi-tardisec-examples) | `app.add_middleware` in `app.py` |
| [Ruby](ruby-tardisec-examples) | Rack middleware in `middleware.rb` |
| [Rust](rust-tardisec-examples) | `middleware::from_fn` in `src/main.rs` |
| [Plug](plug-tardisec-examples) | `plug TardisecPlug` in the pipeline |
| [Phoenix](phoenix-tardisec-examples) | `plug TardisecPlug` in `lib/endpoint.ex` |
| [Laravel](laravel-tardisec-examples) | global middleware in `bootstrap/app.php` |
| [Symfony](symfony-tardisec-examples) | `kernel.response` subscriber |
| [PSR-15](psr15-tardisec-examples) | `MiddlewareInterface` in the pipeline |
| [ASP.NET Core](aspnetcore-tardisec-examples) | `OnStarting` middleware in `Program.cs` |
| [Jakarta Servlet](servlet-tardisec-examples) | filter, via `@WebFilter` or `web.xml` |
| [Spring Boot](spring-boot-tardisec-examples) | filter, via `FilterRegistrationBean` |

Two of these cannot cover everything from app code. RedwoodJS applies headers to the api side
only, because its web side is a static SPA in the default deploy shape. Astro's middleware is
inert under `output: 'static'`. Both READMEs say so and point at the host snippets below.

## No application code needed

Hosts and servers apply the same manifest without any code. Pull the snippet and drop it in:
`.tardisec.nginx.conf`, `.tardisec.apache.conf`, `.tardisec.caddyfile`,
`.tardisec.vercel.json`, `.tardisec.netlify.headers`, `.tardisec.cloudflare.headers`, or
`.tardisec.cloudfront-cloudformation.json`. The nginx and Caddy snippets include the
`/.well-known/tardisec-verification.txt` serving block, so they are complete drop-ins.

Every recommend target is servable, not just those: one file per target, named for the language
it is written in. Rather than keep a list here that goes stale on every new target, ask the API
what your domain has: `GET /v1/recommendation/{fqdn}` returns every available file with its
ETag, so a script can pull the set and skip what has not changed. Each directory's workflow
names the one or two files that directory needs, which is what you want in a repo; the listing
is for tooling that has to discover them.

CloudFront is the one target that cannot take the map as it stands, so all four of its flavours
split it the same way. The six headers CloudFront gives a dedicated field
(`Content-Security-Policy`, `Referrer-Policy`, `Strict-Transport-Security`,
`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`) go in the security headers
block, with HSTS parsed into its structured fields rather than passed through as a string, and
everything else rides as a custom header. That placement is what buys you a raise path: the
1783 character limit on the CSP is adjustable through Service Quotas `L-E9944CCE` only from the
security headers block. `Permissions-Policy` is omitted entirely, since at 2212 characters it
exceeds the flat custom-header cap that AWS does not adjust; the served file says to serve it
from your origin. Origin override is false throughout, so a header your origin already sets
wins, including a per-request CSP carrying a nonce that no static policy could reproduce.

**Raise Service Quotas `L-8FE99263` before your first apply.** The policy sets 18 custom
headers against a default of 10 per policy, and the apply fails without it. Entries in the
security headers block do not count against that quota.

## Platforms that run neither your code nor a plugin

Wix, Squarespace, Webflow, Shopify Liquid, Ghost(Pro), Builder.io hosted pages, and GitHub
Pages allow no custom response headers, and no plugin can add them. Front the domain with your
own Cloudflare and apply the config at the edge instead:
[cloudflare-workers-tardisec-examples](cloudflare-workers-tardisec-examples), which also serves
the verification file so the domain verifies over HTTP with no DNS access.

CMS plugins and CI integrations each have their own repo; see
[tardisec/tardisec-integration-template](https://github.com/tardisec/tardisec-integration-template) for the
full list and the raw API.

## About the checked-in files

The `.tardisec.*` files here are generated for `example.com` in strict remediation mode with
a few confirmed allow-rules, so the enforce policy has real sources in it. Yours differ by
domain, remediation mode, and what tardisec has observed. They are byte-for-byte what the
API serves, tab-indented with a trailing newline, so they are not reformatted here; the sync
action's `format` input is what hands them to your own formatter before they land in a PR.
