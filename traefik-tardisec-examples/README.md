# Traefik × tardisec

The synced tardisec config as a Traefik v3 headers middleware, in both shapes Traefik takes it:
a `Middleware` resource on Kubernetes, and container labels under Docker Compose. No application
code.

| File | What it does |
| --- | --- |
| `compose.yaml` | Wiring only. The Docker router, and the label that attaches the middleware |
| `ingressroute.yaml` | Wiring only. The Kubernetes `IngressRoute` that references the `Middleware` |
| `.tardisec.traefik.yaml` | Synced. Both shapes: the `Middleware` resource and the Compose label block |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

One file, two shapes, because Traefik's dynamic configuration is the same model under both
providers: a middleware of type `headers` carrying a name to value map. On Kubernetes that is
`spec.headers.customResponseHeaders` on a `Middleware`; under Docker it is one
`traefik.http.middlewares.tardisec.headers.customresponseheaders.<Name>` label per header, which
is the same field with the label provider's lowercasing. Take the half that matches how you run
it.

## Docker Compose

The labels go on the service Traefik routes to, not on the Traefik container. Paste the synced
Compose block into that service's `labels` list, then attach it:

```yaml
labels:
  - traefik.http.routers.site.middlewares=tardisec@docker
```

**That last line is the one people miss.** Defining a middleware without referencing it from a
router is not an error: the labels are valid, Traefik starts clean, nothing logs, and no header
changes. The same is true of the Kubernetes shape.

The `@docker` suffix names the provider the middleware came from. Traefik namespaces middleware
by provider, so a file-provider middleware is `tardisec@file` and a Kubernetes one is
`tardisec@kubernetescrd`. Mixing providers without the suffix is the second way this silently
does nothing.

Running Traefik behind another proxy, or with `--providers.docker.exposedbydefault=false`? The
router labels above still apply; only `traefik.enable=true` becomes load-bearing.

## Kubernetes

`kubectl apply -f .tardisec.traefik.yaml -f ingressroute.yaml`. The `Middleware` and the
`IngressRoute` must be in the same namespace, or the reference needs the `namespace-name` form.

Traefik v3 uses the `traefik.io/v1alpha1` API group. On v2 it was `traefik.containo.us`, and a v2
install will not read these resources; the field names are otherwise unchanged.

Using a plain `Ingress` rather than `IngressRoute`? The annotation
`traefik.ingress.kubernetes.io/router.middlewares: default-tardisec@kubernetescrd` does the same
attaching. Traefik also implements Gateway API, which is the more portable route if you are
moving that way: [gateway-api-tardisec-examples](../gateway-api-tardisec-examples).

## One behaviour worth knowing

In `customResponseHeaders`, a header set to an empty string is **deleted**, not set empty. The
manifest never emits an empty value, so this only bites if you hand-edit the synced file to
"turn off" a header: that removes whatever the origin sent as well.

Headers are set on the response, so anything the backend sent is overwritten. The middleware
covers every response the router serves, including error pages Traefik generates itself.

## Keeping the files current

Copy `.github/workflows/tardisec.yml` to your repo root and set `domain`. It runs weekly,
authenticates with the workflow's OIDC token (no stored secret), and opens a PR only when one of
the files actually changed. Merging it is what changes the headers, so redeploy after.

Other providers, `path` / `format` / `pull-request` inputs, and the multi-directory recipe
for `.well-known/`: [tardisec/tardisec-integration-github-action](https://github.com/tardisec/tardisec-integration-github-action).
Not on GitHub? [tardisec/tardisec-integration-template](https://github.com/tardisec/tardisec-integration-template)
lists every integration and the raw API.

## What the manifest carries that the middleware can't apply

`.tardisec.json` also has `dns` (`TYPE` → label → values, `""` = the origin) and
`.well-known` (filename → content). Publish the DNS records in your zone and serve
`.well-known/tardisec-verification.txt` verbatim from the backend behind Traefik.

The synced files are generated for `example.com` with a few confirmed allow-rules; yours differ
by domain, remediation mode, and what tardisec has observed.
