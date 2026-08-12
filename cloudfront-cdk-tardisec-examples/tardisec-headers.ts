import * as fs from "node:fs";
import { Duration } from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import type { Construct } from "constructs";

// The response headers policy, built from the synced manifest so the deployed headers and
// .tardisec.json cannot drift apart. aws-cdk-lib v2.
const headers: Record<string, string> = JSON.parse(
	fs.readFileSync(`${__dirname}/.tardisec.json`, "utf8"),
).http.headers;

// These six have a dedicated field in securityHeadersBehavior, so they are set there rather
// than as custom headers. That is also the only placement where the CSP length limit is
// adjustable, via Service Quotas L-E9944CCE.
const reserved = [
	"Content-Security-Policy",
	"Referrer-Policy",
	"Strict-Transport-Security",
	"X-Content-Type-Options",
	"X-Frame-Options",
	"X-XSS-Protection",
];

// Attach with the behaviour option: { responseHeadersPolicy: tardisecHeaders(this) }
export const tardisecHeaders = (scope: Construct) =>
	new cloudfront.ResponseHeadersPolicy(scope, "TardisecHeaders", {
		responseHeadersPolicyName: "tardisec-headers",
		customHeadersBehavior: {
			// A custom header value is capped at 1783 characters and there is no increase for it,
			// so anything longer is dropped here rather than failing the deploy.
			// Permissions-Policy is 2212 characters in this manifest; the origin serves it.
			customHeaders: Object.entries(headers)
				.filter(
					([header, value]) =>
						!reserved.includes(header) && value.length <= 1783,
				)
				// The origin's own header wins; CloudFront only fills in what it did not set.
				.map(([header, value]) => ({ header, value, override: false })),
		},
		securityHeadersBehavior: {
			contentSecurityPolicy: {
				contentSecurityPolicy: headers["Content-Security-Policy"],
				override: false,
			},
			contentTypeOptions: { override: false },
			// Enums, not strings; they match X-Frame-Options and Referrer-Policy in the manifest.
			frameOptions: {
				frameOption: cloudfront.HeadersFrameOption.DENY,
				override: false,
			},
			referrerPolicy: {
				referrerPolicy: cloudfront.HeadersReferrerPolicy.NO_REFERRER,
				override: false,
			},
			// Parts, not a header string; they match Strict-Transport-Security in the manifest.
			strictTransportSecurity: {
				accessControlMaxAge: Duration.days(365),
				includeSubdomains: true,
				preload: true,
				override: false,
			},
		},
	});
