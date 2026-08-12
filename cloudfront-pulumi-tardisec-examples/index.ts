import * as fs from "node:fs";
import * as aws from "@pulumi/aws";

// The response headers policy, built from the synced manifest so the deployed headers and
// .tardisec.json cannot drift apart. @pulumi/aws v6+.
const headers: Record<string, string> = JSON.parse(
	fs.readFileSync(`${__dirname}/.tardisec.json`, "utf8"),
).http.headers;

// These six have a dedicated field in securityHeadersConfig, so they are set there rather than
// as custom headers. That is also the only placement where the CSP length limit is adjustable,
// via Service Quotas L-E9944CCE.
const reserved = [
	"Content-Security-Policy",
	"Referrer-Policy",
	"Strict-Transport-Security",
	"X-Content-Type-Options",
	"X-Frame-Options",
	"X-XSS-Protection",
];

// A custom header value is capped at 1783 characters and there is no increase for it, so
// anything longer is dropped here rather than failing the deploy. Permissions-Policy is 2212
// characters in this manifest; the origin serves it.
const items = Object.entries(headers)
	.filter(([header, value]) => !reserved.includes(header) && value.length <= 1783)
	// The origin's own header wins; CloudFront only fills in what the origin did not set.
	.map(([header, value]) => ({ header, value, override: false }));

export const tardisecHeaders = new aws.cloudfront.ResponseHeadersPolicy(
	"tardisec-headers",
	{
		name: "tardisec-headers",
		customHeadersConfig: { items },
		securityHeadersConfig: {
			contentSecurityPolicy: {
				contentSecurityPolicy: headers["Content-Security-Policy"],
				override: false,
			},
			contentTypeOptions: { override: false },
			frameOptions: {
				frameOption: headers["X-Frame-Options"],
				override: false,
			},
			referrerPolicy: {
				referrerPolicy: headers["Referrer-Policy"],
				override: false,
			},
			// Parts, not a header string; they match Strict-Transport-Security in the manifest.
			strictTransportSecurity: {
				accessControlMaxAgeSec: 31536000,
				includeSubdomains: true,
				preload: true,
				override: false,
			},
		},
	},
);

// Attach it to every behavior that serves HTML:
//
//   responseHeadersPolicyId: tardisecHeaders.id
