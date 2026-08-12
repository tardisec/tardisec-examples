# Kubernetes Gateway API × tardisec

The synced tardisec config as an `HTTPRoute` with a `ResponseHeaderModifier` filter, applied by
whichever Gateway controller you run. No application code, no controller-specific annotations.

| File | What it does |
| --- | --- |
| `gateway.yaml` | Wiring only. The `Gateway` the synced route attaches to |
| `.tardisec.gateway-api.yaml` | Synced. The `HTTPRoute` carrying the header filter |
| `.tardisec.json` | Synced. DNS records, the full header map, and `/.well-known/` contents |

One manifest, every controller: Istio, Envoy Gateway, Traefik, Cilium, NGINX Gateway Fabric,
HAProxy and Kong all implement Gateway API, so this replaces a different annotation dialect per
ingress controller with one resource. ingress-nginx was archived in March 2026 with Gateway API
named its successor, so if you are moving off it, this is the shape to move to.

`kubectl apply -f gateway.yaml -f .tardisec.gateway-api.yaml`, with `gatewayClassName` set to
the class your controller registers.

## Extended conformance, not Core

`ResponseHeaderModifier` is an **Extended** feature in the Gateway API conformance profile, not
a Core one. A conformant controller is not required to implement it, and one that does not is
still conformant. Nothing rejects the resource: it applies, the route works, and the headers do
not appear.

Check before you rely on it. `kubectl get gatewayclass <name> -o yaml` reports
`status.supportedFeatures` on controllers that publish it, and the project's conformance reports
list per-controller results. Istio, Envoy Gateway, Cilium and NGINX Gateway Fabric implement it
today; verify your version rather than trusting a list in a README.

The filter is per rule, not per route, so every rule in a route needs its own copy. If you split
the synced route or merge its rules into your own, carry the filter into each one.

Not running Gateway API? A service mesh or an ingress controller you cannot move off will have
its own header mechanism, and the nginx and Caddy snippets are complete drop-ins if you front
the cluster with either.

## Keeping the files current

Copy `.github/workflows/tardisec.yml` to your repo root and set `domain`. It runs weekly,
authenticates with the workflow's OIDC token (no stored secret), and opens a PR only when one of
the files actually changed. Merging it is what changes the headers, so apply after.

Other providers, `path` / `format` / `pull-request` inputs, and the multi-directory recipe
for `.well-known/`: [tardisec/tardisec-integration-github-action](https://github.com/tardisec/tardisec-integration-github-action).
Not on GitHub? [tardisec/tardisec-integration-template](https://github.com/tardisec/tardisec-integration-template)
lists every integration and the raw API.

## What the manifest carries that the route can't apply

`.tardisec.json` also has `dns` (`TYPE` → label → values, `""` = the origin) and
`.well-known` (filename → content). Publish the DNS records in your zone and serve
`.well-known/tardisec-verification.txt` verbatim from a backend behind the Gateway, or from any
route that answers on the domain.

The synced files are generated for `example.com` with a few confirmed allow-rules; yours differ
by domain, remediation mode, and what tardisec has observed.
