// src/index.js
export default {
  async fetch(request, env, ctx) {
    const res = await fetch(request);
    const newRes = new Response(res.body, res);
    newRes.headers.set("Connection-Allowlist", "(response-origin);report-to=default");
    newRes.headers.set("Connection-Allowlist-Report-Only", "();report-to=default");
    newRes.headers.set("Content-Security-Policy", "base-uri 'none';connect-src 'self';default-src 'report-sample' 'report-sha256';font-src 'self';form-action 'self';frame-ancestors 'none';img-src 'self';manifest-src 'self';report-to default;report-uri https://5e7c9a9e-d31d-5f7a-8599-b72f466a0cae.report-to.org;require-trusted-types-for 'script';script-src-elem 'self' 'report-sample' 'report-sha256';style-src-elem 'self' 'report-sample' 'report-sha256';upgrade-insecure-requests");
    newRes.headers.set("Content-Security-Policy-Report-Only", "base-uri 'none';default-src 'report-sample' 'report-sha256';form-action 'none';frame-ancestors 'none';report-to default;report-uri https://5e7c9a9e-d31d-5f7a-8599-b72f466a0cae.report-to.org;require-trusted-types-for 'script'");
    newRes.headers.set("Cross-Origin-Embedder-Policy", "require-corp;report-to=default");
    newRes.headers.set("Cross-Origin-Opener-Policy", "same-origin;report-to=default");
    newRes.headers.set("Cross-Origin-Resource-Policy", "same-origin");
    newRes.headers.set("Document-Isolation-Policy", "isolate-and-require-corp;report-to=\"default\"");
    newRes.headers.set("Document-Policy", "*;report-to=default");
    newRes.headers.set("Integrity-Policy", "blocked-destinations=(script style),endpoints=(default)");
    newRes.headers.set("NEL", "{\"failure_fraction\":1,\"include_subdomains\":true,\"max_age\":31536000,\"report_to\":\"default\",\"success_fraction\":0}");
    newRes.headers.set("Origin-Agent-Cluster", "?1");
    newRes.headers.set("Permissions-Policy", "accelerometer=(),all-screens-capture=(),ambient-light-sensor=(),aria-notify=(),attribution-reporting=(),autofill=(),autoplay=(),battery=(),bluetooth=(),browsing-topics=(),camera=(),captured-surface-control=(),ch-device-memory=(),ch-downlink=(),ch-dpr=(),ch-ect=(),ch-prefers-color-scheme=(),ch-prefers-reduced-motion=(),ch-prefers-reduced-transparency=(),ch-rtt=(),ch-save-data=(),ch-ua=(),ch-ua-arch=(),ch-ua-bitness=(),ch-ua-form-factors=(),ch-ua-full-version=(),ch-ua-full-version-list=(),ch-ua-high-entropy-values=(),ch-ua-mobile=(),ch-ua-model=(),ch-ua-platform=(),ch-ua-platform-version=(),ch-ua-wow64=(),ch-viewport-height=(),ch-viewport-width=(),ch-width=(),clipboard-read=(),clipboard-write=(),compute-pressure=(),controlled-frame=(),cross-origin-isolated=(),deferred-fetch=(),deferred-fetch-minimal=(),device-attributes=(),digital-credentials-create=(),digital-credentials-get=(),direct-sockets=(),direct-sockets-multicast=(),direct-sockets-private=(),display-capture=(),encrypted-media=(),execution-while-not-rendered=(),execution-while-out-of-viewport=(),focus-without-user-activation=(),fullscreen=(),gamepad=(),geolocation=(),gyroscope=(),hid=(),identity-credentials-get=(),idle-detection=(),interest-cohort=(),join-ad-interest-group=(),keyboard-map=(),language-detector=(),language-model=(),local-fonts=(),local-network=(),local-network-access=(),loopback-network=(),magnetometer=(),manual-text=(),media-playback-while-not-visible=(),mediasession=(),microphone=(),midi=(),monetization=(),navigation-override=(),on-device-speech-recognition=(),otp-credentials=(),payment=(),picture-in-picture=(),private-aggregation=(),private-state-token-issuance=(),private-state-token-redemption=(),publickey-credentials-create=(),publickey-credentials-get=(),record-ad-auction-events=(),rewriter=(),run-ad-auction=(),screen-wake-lock=(),serial=(),shared-storage=(),shared-storage-select-url=(),smart-card=(),speaker-selection=(),storage-access=(),sub-apps=(),summarizer=(),sync-script=(),sync-xhr=(),tools=(),translator=(),trust-token-redemption=(),unload=(),usb=(),usb-unrestricted=(),vertical-scroll=(),web-app-installation=(),web-printing=(),web-share=(),window-management=(),writer=(),xr-spatial-tracking=()");
    newRes.headers.set("Referrer-Policy", "no-referrer");
    newRes.headers.set("Report-To", "{\"endpoints\":[{\"url\":\"https://5e7c9a9e-d31d-5f7a-8599-b72f466a0cae.report-to.org\"}],\"group\":\"default\",\"include_subdomains\":true,\"max_age\":31536000}");
    newRes.headers.set("Reporting-Endpoints", "default=\"https://5e7c9a9e-d31d-5f7a-8599-b72f466a0cae.report-to.org\"");
    newRes.headers.set("Require-Document-Policy", "*;report-to=default");
    newRes.headers.set("Scripting-Policy", "eval=blocked, report-to=default");
    newRes.headers.set("Strict-Transport-Security", "max-age=31536000;includeSubDomains;preload");
    newRes.headers.set("X-Content-Type-Options", "nosniff");
    newRes.headers.set("X-DNS-Prefetch-Control", "off");
    newRes.headers.set("X-Download-Options", "noopen");
    newRes.headers.set("X-Frame-Options", "DENY");
    newRes.headers.set("X-Permitted-Cross-Domain-Policies", "none");
    return newRes;
  },
};