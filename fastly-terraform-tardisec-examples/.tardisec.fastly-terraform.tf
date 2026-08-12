# Fastly VCL service headers. Terraform and OpenTofu read this file identically.
# Fastly has no standalone header resource, so these header blocks belong inside the fastly_service_vcl that already serves your site. The resource below is a scaffold that makes the file valid HCL on its own, and applying it unchanged creates a second service.
# source is a VCL expression, not a string. Every value below is wrapped in VCL's long-string form {"..."}, which takes the content literally, because a plain "..." string would decode percent escapes and cannot hold a double quote at all.
# action is set, never append, so a header the origin already sent is replaced rather than concatenated onto. ignore_if_set defaults to false, which is what makes set authoritative.
# Fastly caps a response at 96 headers (about 85 in practice) and 128 KB of response headers, well clear of this set, and publishes no per-header value length limit.
resource "fastly_service_vcl" "tardisec" {
  name = var.fastly_service_name

  domain {
    name = var.fastly_domain
  }

  backend {
    name    = var.fastly_backend_name
    address = var.fastly_backend_address
  }

  header {
    name        = "tardisec Connection-Allowlist"
    type        = "response"
    action      = "set"
    destination = "http.Connection-Allowlist"
    source      = "{\"(response-origin);report-to=default\"}"
  }

  header {
    name        = "tardisec Connection-Allowlist-Report-Only"
    type        = "response"
    action      = "set"
    destination = "http.Connection-Allowlist-Report-Only"
    source      = "{\"();report-to=default\"}"
  }

  header {
    name        = "tardisec Content-Security-Policy"
    type        = "response"
    action      = "set"
    destination = "http.Content-Security-Policy"
    source      = "{\"base-uri 'none';connect-src 'self';default-src 'report-sample' 'report-sha256';font-src 'self';form-action 'self';frame-ancestors 'none';img-src 'self';manifest-src 'self';report-to default;report-uri https://5e7c9a9e-d31d-5f7a-8599-b72f466a0cae.report-to.org;require-trusted-types-for 'script';script-src-elem 'self' 'report-sample' 'report-sha256';style-src-elem 'self' 'report-sample' 'report-sha256';upgrade-insecure-requests\"}"
  }

  header {
    name        = "tardisec Content-Security-Policy-Report-Only"
    type        = "response"
    action      = "set"
    destination = "http.Content-Security-Policy-Report-Only"
    source      = "{\"base-uri 'none';default-src 'report-sample' 'report-sha256';form-action 'none';frame-ancestors 'none';report-to default;report-uri https://5e7c9a9e-d31d-5f7a-8599-b72f466a0cae.report-to.org;require-trusted-types-for 'script'\"}"
  }

  header {
    name        = "tardisec Cross-Origin-Embedder-Policy"
    type        = "response"
    action      = "set"
    destination = "http.Cross-Origin-Embedder-Policy"
    source      = "{\"require-corp;report-to=default\"}"
  }

  header {
    name        = "tardisec Cross-Origin-Opener-Policy"
    type        = "response"
    action      = "set"
    destination = "http.Cross-Origin-Opener-Policy"
    source      = "{\"same-origin;report-to=default\"}"
  }

  header {
    name        = "tardisec Cross-Origin-Resource-Policy"
    type        = "response"
    action      = "set"
    destination = "http.Cross-Origin-Resource-Policy"
    source      = "{\"same-origin\"}"
  }

  header {
    name        = "tardisec Document-Isolation-Policy"
    type        = "response"
    action      = "set"
    destination = "http.Document-Isolation-Policy"
    source      = "{\"isolate-and-require-corp;report-to=\"default\"\"}"
  }

  header {
    name        = "tardisec Document-Policy"
    type        = "response"
    action      = "set"
    destination = "http.Document-Policy"
    source      = "{\"*;report-to=default\"}"
  }

  header {
    name        = "tardisec Integrity-Policy"
    type        = "response"
    action      = "set"
    destination = "http.Integrity-Policy"
    source      = "{\"blocked-destinations=(script style),endpoints=(default)\"}"
  }

  header {
    name        = "tardisec NEL"
    type        = "response"
    action      = "set"
    destination = "http.NEL"
    source      = "{\"{\"failure_fraction\":1,\"include_subdomains\":true,\"max_age\":31536000,\"report_to\":\"default\",\"success_fraction\":0}\"}"
  }

  header {
    name        = "tardisec Origin-Agent-Cluster"
    type        = "response"
    action      = "set"
    destination = "http.Origin-Agent-Cluster"
    source      = "{\"?1\"}"
  }

  header {
    name        = "tardisec Permissions-Policy"
    type        = "response"
    action      = "set"
    destination = "http.Permissions-Policy"
    source      = "{\"accelerometer=(),all-screens-capture=(),ambient-light-sensor=(),aria-notify=(),attribution-reporting=(),autofill=(),autoplay=(),battery=(),bluetooth=(),browsing-topics=(),camera=(),captured-surface-control=(),ch-device-memory=(),ch-downlink=(),ch-dpr=(),ch-ect=(),ch-prefers-color-scheme=(),ch-prefers-reduced-motion=(),ch-prefers-reduced-transparency=(),ch-rtt=(),ch-save-data=(),ch-ua=(),ch-ua-arch=(),ch-ua-bitness=(),ch-ua-form-factors=(),ch-ua-full-version=(),ch-ua-full-version-list=(),ch-ua-high-entropy-values=(),ch-ua-mobile=(),ch-ua-model=(),ch-ua-platform=(),ch-ua-platform-version=(),ch-ua-wow64=(),ch-viewport-height=(),ch-viewport-width=(),ch-width=(),clipboard-read=(),clipboard-write=(),compute-pressure=(),controlled-frame=(),cross-origin-isolated=(),deferred-fetch=(),deferred-fetch-minimal=(),device-attributes=(),digital-credentials-create=(),digital-credentials-get=(),direct-sockets=(),direct-sockets-multicast=(),direct-sockets-private=(),display-capture=(),encrypted-media=(),execution-while-not-rendered=(),execution-while-out-of-viewport=(),focus-without-user-activation=(),fullscreen=(),gamepad=(),geolocation=(),gyroscope=(),hid=(),identity-credentials-get=(),idle-detection=(),interest-cohort=(),join-ad-interest-group=(),keyboard-map=(),language-detector=(),language-model=(),local-fonts=(),local-network=(),local-network-access=(),loopback-network=(),magnetometer=(),manual-text=(),media-playback-while-not-visible=(),mediasession=(),microphone=(),midi=(),monetization=(),navigation-override=(),on-device-speech-recognition=(),otp-credentials=(),payment=(),picture-in-picture=(),private-aggregation=(),private-state-token-issuance=(),private-state-token-redemption=(),publickey-credentials-create=(),publickey-credentials-get=(),record-ad-auction-events=(),rewriter=(),run-ad-auction=(),screen-wake-lock=(),serial=(),shared-storage=(),shared-storage-select-url=(),smart-card=(),speaker-selection=(),storage-access=(),sub-apps=(),summarizer=(),sync-script=(),sync-xhr=(),tools=(),translator=(),trust-token-redemption=(),unload=(),usb=(),usb-unrestricted=(),vertical-scroll=(),web-app-installation=(),web-printing=(),web-share=(),window-management=(),writer=(),xr-spatial-tracking=()\"}"
  }

  header {
    name        = "tardisec Referrer-Policy"
    type        = "response"
    action      = "set"
    destination = "http.Referrer-Policy"
    source      = "{\"no-referrer\"}"
  }

  header {
    name        = "tardisec Report-To"
    type        = "response"
    action      = "set"
    destination = "http.Report-To"
    source      = "\"{%22endpoints%22:[{%22url%22:%22https://5e7c9a9e-d31d-5f7a-8599-b72f466a0cae.report-to.org%22}],%22group%22:%22default%22,%22include_subdomains%22:true,%22max_age%22:31536000}\""
  }

  header {
    name        = "tardisec Reporting-Endpoints"
    type        = "response"
    action      = "set"
    destination = "http.Reporting-Endpoints"
    source      = "{\"default=\"https://5e7c9a9e-d31d-5f7a-8599-b72f466a0cae.report-to.org\"\"}"
  }

  header {
    name        = "tardisec Require-Document-Policy"
    type        = "response"
    action      = "set"
    destination = "http.Require-Document-Policy"
    source      = "{\"*;report-to=default\"}"
  }

  header {
    name        = "tardisec Scripting-Policy"
    type        = "response"
    action      = "set"
    destination = "http.Scripting-Policy"
    source      = "{\"eval=blocked, report-to=default\"}"
  }

  header {
    name        = "tardisec Strict-Transport-Security"
    type        = "response"
    action      = "set"
    destination = "http.Strict-Transport-Security"
    source      = "{\"max-age=31536000;includeSubDomains;preload\"}"
  }

  header {
    name        = "tardisec X-Content-Type-Options"
    type        = "response"
    action      = "set"
    destination = "http.X-Content-Type-Options"
    source      = "{\"nosniff\"}"
  }

  header {
    name        = "tardisec X-DNS-Prefetch-Control"
    type        = "response"
    action      = "set"
    destination = "http.X-DNS-Prefetch-Control"
    source      = "{\"off\"}"
  }

  header {
    name        = "tardisec X-Download-Options"
    type        = "response"
    action      = "set"
    destination = "http.X-Download-Options"
    source      = "{\"noopen\"}"
  }

  header {
    name        = "tardisec X-Frame-Options"
    type        = "response"
    action      = "set"
    destination = "http.X-Frame-Options"
    source      = "{\"DENY\"}"
  }

  header {
    name        = "tardisec X-Permitted-Cross-Domain-Policies"
    type        = "response"
    action      = "set"
    destination = "http.X-Permitted-Cross-Domain-Policies"
    source      = "{\"none\"}"
  }
}