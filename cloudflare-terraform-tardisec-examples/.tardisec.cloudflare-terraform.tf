# cloudflare.tf: cloudflare provider >= 5 (v4 used repeated `rules`/`headers` blocks; see cloudflare tf-migrate)
resource "cloudflare_ruleset" "tardisec_headers" {
  zone_id = var.cloudflare_zone_id
  name    = "tardisec-headers"
  kind    = "zone"
  phase   = "http_response_headers_transform"

  rules = [{
    action      = "rewrite"
    expression  = "true"
    description = "tardisec reporting headers"
    action_parameters = {
      headers = {
        "Connection-Allowlist"                = { operation = "set", value = "(response-origin);report-to=default" }
        "Connection-Allowlist-Report-Only"    = { operation = "set", value = "();report-to=default" }
        "Content-Security-Policy"             = { operation = "set", value = "base-uri 'none';connect-src 'self';default-src 'report-sample' 'report-sha256';font-src 'self';form-action 'self';frame-ancestors 'none';img-src 'self';manifest-src 'self';report-to default;report-uri https://5e7c9a9e-d31d-5f7a-8599-b72f466a0cae.report-to.org;require-trusted-types-for 'script';script-src-elem 'self' 'report-sample' 'report-sha256';style-src-elem 'self' 'report-sample' 'report-sha256';upgrade-insecure-requests" }
        "Content-Security-Policy-Report-Only" = { operation = "set", value = "base-uri 'none';default-src 'report-sample' 'report-sha256';form-action 'none';frame-ancestors 'none';report-to default;report-uri https://5e7c9a9e-d31d-5f7a-8599-b72f466a0cae.report-to.org;require-trusted-types-for 'script'" }
        "Cross-Origin-Embedder-Policy"        = { operation = "set", value = "require-corp;report-to=default" }
        "Cross-Origin-Opener-Policy"          = { operation = "set", value = "same-origin;report-to=default" }
        "Cross-Origin-Resource-Policy"        = { operation = "set", value = "same-origin" }
        "Document-Isolation-Policy"           = { operation = "set", value = "isolate-and-require-corp;report-to=\"default\"" }
        "Document-Policy"                     = { operation = "set", value = "*;report-to=default" }
        "Integrity-Policy"                    = { operation = "set", value = "blocked-destinations=(script style),endpoints=(default)" }
        "NEL"                                 = { operation = "set", value = "{\"failure_fraction\":1,\"include_subdomains\":true,\"max_age\":31536000,\"report_to\":\"default\",\"success_fraction\":0}" }
        "Origin-Agent-Cluster"                = { operation = "set", value = "?1" }
        "Permissions-Policy"                  = { operation = "set", value = "accelerometer=(),all-screens-capture=(),ambient-light-sensor=(),aria-notify=(),attribution-reporting=(),autofill=(),autoplay=(),battery=(),bluetooth=(),browsing-topics=(),camera=(),captured-surface-control=(),ch-device-memory=(),ch-downlink=(),ch-dpr=(),ch-ect=(),ch-prefers-color-scheme=(),ch-prefers-reduced-motion=(),ch-prefers-reduced-transparency=(),ch-rtt=(),ch-save-data=(),ch-ua=(),ch-ua-arch=(),ch-ua-bitness=(),ch-ua-form-factors=(),ch-ua-full-version=(),ch-ua-full-version-list=(),ch-ua-high-entropy-values=(),ch-ua-mobile=(),ch-ua-model=(),ch-ua-platform=(),ch-ua-platform-version=(),ch-ua-wow64=(),ch-viewport-height=(),ch-viewport-width=(),ch-width=(),clipboard-read=(),clipboard-write=(),compute-pressure=(),controlled-frame=(),cross-origin-isolated=(),deferred-fetch=(),deferred-fetch-minimal=(),device-attributes=(),digital-credentials-create=(),digital-credentials-get=(),direct-sockets=(),direct-sockets-multicast=(),direct-sockets-private=(),display-capture=(),encrypted-media=(),execution-while-not-rendered=(),execution-while-out-of-viewport=(),focus-without-user-activation=(),fullscreen=(),gamepad=(),geolocation=(),gyroscope=(),hid=(),identity-credentials-get=(),idle-detection=(),interest-cohort=(),join-ad-interest-group=(),keyboard-map=(),language-detector=(),language-model=(),local-fonts=(),local-network=(),local-network-access=(),loopback-network=(),magnetometer=(),manual-text=(),media-playback-while-not-visible=(),mediasession=(),microphone=(),midi=(),monetization=(),navigation-override=(),on-device-speech-recognition=(),otp-credentials=(),payment=(),picture-in-picture=(),private-aggregation=(),private-state-token-issuance=(),private-state-token-redemption=(),publickey-credentials-create=(),publickey-credentials-get=(),record-ad-auction-events=(),rewriter=(),run-ad-auction=(),screen-wake-lock=(),serial=(),shared-storage=(),shared-storage-select-url=(),smart-card=(),speaker-selection=(),storage-access=(),sub-apps=(),summarizer=(),sync-script=(),sync-xhr=(),tools=(),translator=(),trust-token-redemption=(),unload=(),usb=(),usb-unrestricted=(),vertical-scroll=(),web-app-installation=(),web-printing=(),web-share=(),window-management=(),writer=(),xr-spatial-tracking=()" }
        "Referrer-Policy"                     = { operation = "set", value = "no-referrer" }
        "Report-To"                           = { operation = "set", value = "{\"endpoints\":[{\"url\":\"https://5e7c9a9e-d31d-5f7a-8599-b72f466a0cae.report-to.org\"}],\"group\":\"default\",\"include_subdomains\":true,\"max_age\":31536000}" }
        "Reporting-Endpoints"                 = { operation = "set", value = "default=\"https://5e7c9a9e-d31d-5f7a-8599-b72f466a0cae.report-to.org\"" }
        "Require-Document-Policy"             = { operation = "set", value = "*;report-to=default" }
        "Scripting-Policy"                    = { operation = "set", value = "eval=blocked, report-to=default" }
        "Strict-Transport-Security"           = { operation = "set", value = "max-age=31536000;includeSubDomains;preload" }
        "X-Content-Type-Options"              = { operation = "set", value = "nosniff" }
        "X-DNS-Prefetch-Control"              = { operation = "set", value = "off" }
        "X-Download-Options"                  = { operation = "set", value = "noopen" }
        "X-Frame-Options"                     = { operation = "set", value = "DENY" }
        "X-Permitted-Cross-Domain-Policies"   = { operation = "set", value = "none" }
      }
    }
  }]
}