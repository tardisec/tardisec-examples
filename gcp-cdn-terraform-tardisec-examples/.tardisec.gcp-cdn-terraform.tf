# Google Cloud external Application Load Balancer custom response headers. Terraform and OpenTofu read this file identically.
# Headers are added by the load balancer, so they only appear on responses served through it. A request made directly to the Cloud Storage API gets none of them.
# Brace characters in the values below are doubled on purpose. The load balancer reads {name} as a variable and expands an unrecognized one to an empty string, so an unescaped JSON value would apply cleanly and then arrive blank.
# The two resources below are scaffolds that show where the attribute goes. If you already declare a backend service or bucket, move the custom_response_headers line into it and delete the scaffold, because applying this file unchanged creates new empty backends.
# A backend service takes at most 16 custom response headers and 8192 bytes of names plus values, neither of which is adjustable. Require-Document-Policy, Scripting-Policy, Strict-Transport-Security, X-Content-Type-Options, X-DNS-Prefetch-Control, X-Download-Options, X-Frame-Options, X-Permitted-Cross-Domain-Policies are omitted here. Serve them from your origin instead.
locals {
  tardisec_response_headers = [
    "Connection-Allowlist:(response-origin);report-to=default",
    "Connection-Allowlist-Report-Only:();report-to=default",
    "Content-Security-Policy:base-uri 'none';connect-src 'self';default-src 'report-sample' 'report-sha256';font-src 'self';form-action 'self';frame-ancestors 'none';img-src 'self';manifest-src 'self';report-to default;report-uri https://5e7c9a9e-d31d-5f7a-8599-b72f466a0cae.report-to.org;require-trusted-types-for 'script';script-src-elem 'self' 'report-sample' 'report-sha256';style-src-elem 'self' 'report-sample' 'report-sha256';upgrade-insecure-requests",
    "Content-Security-Policy-Report-Only:base-uri 'none';default-src 'report-sample' 'report-sha256';form-action 'none';frame-ancestors 'none';report-to default;report-uri https://5e7c9a9e-d31d-5f7a-8599-b72f466a0cae.report-to.org;require-trusted-types-for 'script'",
    "Cross-Origin-Embedder-Policy:require-corp;report-to=default",
    "Cross-Origin-Opener-Policy:same-origin;report-to=default",
    "Cross-Origin-Resource-Policy:same-origin",
    "Document-Isolation-Policy:isolate-and-require-corp;report-to=\"default\"",
    "Document-Policy:*;report-to=default",
    "Integrity-Policy:blocked-destinations=(script style),endpoints=(default)",
    "NEL:{{\"failure_fraction\":1,\"include_subdomains\":true,\"max_age\":31536000,\"report_to\":\"default\",\"success_fraction\":0}}",
    "Origin-Agent-Cluster:?1",
    "Permissions-Policy:accelerometer=(),all-screens-capture=(),ambient-light-sensor=(),aria-notify=(),attribution-reporting=(),autofill=(),autoplay=(),battery=(),bluetooth=(),browsing-topics=(),camera=(),captured-surface-control=(),ch-device-memory=(),ch-downlink=(),ch-dpr=(),ch-ect=(),ch-prefers-color-scheme=(),ch-prefers-reduced-motion=(),ch-prefers-reduced-transparency=(),ch-rtt=(),ch-save-data=(),ch-ua=(),ch-ua-arch=(),ch-ua-bitness=(),ch-ua-form-factors=(),ch-ua-full-version=(),ch-ua-full-version-list=(),ch-ua-high-entropy-values=(),ch-ua-mobile=(),ch-ua-model=(),ch-ua-platform=(),ch-ua-platform-version=(),ch-ua-wow64=(),ch-viewport-height=(),ch-viewport-width=(),ch-width=(),clipboard-read=(),clipboard-write=(),compute-pressure=(),controlled-frame=(),cross-origin-isolated=(),deferred-fetch=(),deferred-fetch-minimal=(),device-attributes=(),digital-credentials-create=(),digital-credentials-get=(),direct-sockets=(),direct-sockets-multicast=(),direct-sockets-private=(),display-capture=(),encrypted-media=(),execution-while-not-rendered=(),execution-while-out-of-viewport=(),focus-without-user-activation=(),fullscreen=(),gamepad=(),geolocation=(),gyroscope=(),hid=(),identity-credentials-get=(),idle-detection=(),interest-cohort=(),join-ad-interest-group=(),keyboard-map=(),language-detector=(),language-model=(),local-fonts=(),local-network=(),local-network-access=(),loopback-network=(),magnetometer=(),manual-text=(),media-playback-while-not-visible=(),mediasession=(),microphone=(),midi=(),monetization=(),navigation-override=(),on-device-speech-recognition=(),otp-credentials=(),payment=(),picture-in-picture=(),private-aggregation=(),private-state-token-issuance=(),private-state-token-redemption=(),publickey-credentials-create=(),publickey-credentials-get=(),record-ad-auction-events=(),rewriter=(),run-ad-auction=(),screen-wake-lock=(),serial=(),shared-storage=(),shared-storage-select-url=(),smart-card=(),speaker-selection=(),storage-access=(),sub-apps=(),summarizer=(),sync-script=(),sync-xhr=(),tools=(),translator=(),trust-token-redemption=(),unload=(),usb=(),usb-unrestricted=(),vertical-scroll=(),web-app-installation=(),web-printing=(),web-share=(),window-management=(),writer=(),xr-spatial-tracking=()",
    "Referrer-Policy:no-referrer",
    "Report-To:{{\"endpoints\":[{{\"url\":\"https://5e7c9a9e-d31d-5f7a-8599-b72f466a0cae.report-to.org\"}}],\"group\":\"default\",\"include_subdomains\":true,\"max_age\":31536000}}",
    "Reporting-Endpoints:default=\"https://5e7c9a9e-d31d-5f7a-8599-b72f466a0cae.report-to.org\"",
  ]
}

resource "google_compute_backend_service" "tardisec" {
  name                    = var.backend_service_name
  custom_response_headers = local.tardisec_response_headers
}

resource "google_compute_backend_bucket" "tardisec" {
  name                    = var.backend_bucket_name
  bucket_name             = var.bucket_name
  custom_response_headers = local.tardisec_response_headers
}