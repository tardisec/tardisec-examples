// lib/tardisec-stack.ts: aws-cdk-lib v2
// Content-Security-Policy is set in security_headers_config rather than as a custom header. That is the only placement where its 1783 character limit is adjustable, via Service Quotas L-E9944CCE.
// Permissions-Policy exceeds the 1783 character CloudFront custom header value cap, which is not adjustable, so it is omitted here. Serve it from your origin instead.
// This policy sets 18 custom headers and the default quota is 10 per policy. Raise Service Quotas L-8FE99263 (CloudFront, us-east-1) before you apply. The security_headers_config entries do not count against it.
// Origin override is false throughout: the origin's own header wins and CloudFront only fills in what the origin did not set.
import { Duration } from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";

// Attach with behaviour option: { responseHeadersPolicy: tardisecHeaders }
const tardisecHeaders = new cloudfront.ResponseHeadersPolicy(this, "TardisecHeaders", {
  responseHeadersPolicyName: "tardisec-headers",
  securityHeadersBehavior: {
    contentSecurityPolicy: { contentSecurityPolicy: "base-uri 'none';connect-src 'self';default-src 'report-sample' 'report-sha256';font-src 'self';form-action 'self';frame-ancestors 'none';img-src 'self';manifest-src 'self';report-to default;report-uri https://5e7c9a9e-d31d-5f7a-8599-b72f466a0cae.report-to.org;require-trusted-types-for 'script';script-src-elem 'self' 'report-sample' 'report-sha256';style-src-elem 'self' 'report-sample' 'report-sha256';upgrade-insecure-requests", override: false },
    contentTypeOptions: { override: false },
    frameOptions: { frameOption: cloudfront.HeadersFrameOption.DENY, override: false },
    referrerPolicy: { referrerPolicy: cloudfront.HeadersReferrerPolicy.NO_REFERRER, override: false },
    strictTransportSecurity: { accessControlMaxAge: Duration.seconds(31536000), includeSubdomains: true, preload: true, override: false },
  },
  customHeadersBehavior: {
    customHeaders: [
      { header: "Connection-Allowlist", value: "(response-origin);report-to=default", override: false },
      { header: "Connection-Allowlist-Report-Only", value: "();report-to=default", override: false },
      { header: "Content-Security-Policy-Report-Only", value: "base-uri 'none';default-src 'report-sample' 'report-sha256';form-action 'none';frame-ancestors 'none';report-to default;report-uri https://5e7c9a9e-d31d-5f7a-8599-b72f466a0cae.report-to.org;require-trusted-types-for 'script'", override: false },
      { header: "Cross-Origin-Embedder-Policy", value: "require-corp;report-to=default", override: false },
      { header: "Cross-Origin-Opener-Policy", value: "same-origin;report-to=default", override: false },
      { header: "Cross-Origin-Resource-Policy", value: "same-origin", override: false },
      { header: "Document-Isolation-Policy", value: "isolate-and-require-corp;report-to=\"default\"", override: false },
      { header: "Document-Policy", value: "*;report-to=default", override: false },
      { header: "Integrity-Policy", value: "blocked-destinations=(script style),endpoints=(default)", override: false },
      { header: "NEL", value: "{\"failure_fraction\":1,\"include_subdomains\":true,\"max_age\":31536000,\"report_to\":\"default\",\"success_fraction\":0}", override: false },
      { header: "Origin-Agent-Cluster", value: "?1", override: false },
      { header: "Report-To", value: "{\"endpoints\":[{\"url\":\"https://5e7c9a9e-d31d-5f7a-8599-b72f466a0cae.report-to.org\"}],\"group\":\"default\",\"include_subdomains\":true,\"max_age\":31536000}", override: false },
      { header: "Reporting-Endpoints", value: "default=\"https://5e7c9a9e-d31d-5f7a-8599-b72f466a0cae.report-to.org\"", override: false },
      { header: "Require-Document-Policy", value: "*;report-to=default", override: false },
      { header: "Scripting-Policy", value: "eval=blocked, report-to=default", override: false },
      { header: "X-DNS-Prefetch-Control", value: "off", override: false },
      { header: "X-Download-Options", value: "noopen", override: false },
      { header: "X-Permitted-Cross-Domain-Policies", value: "none", override: false },
    ],
  },
});