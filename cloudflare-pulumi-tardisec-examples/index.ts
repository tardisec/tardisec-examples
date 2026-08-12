import * as fs from "node:fs";
import * as cloudflare from "@pulumi/cloudflare";
import * as pulumi from "@pulumi/pulumi";

// The Transform Rule, built from the synced manifest so the rule and .tardisec.json cannot
// drift apart. @pulumi/cloudflare v6, which carries the provider v5 rewrite: headers are a map
// keyed by header name, not repeated blocks.
const headers: Record<string, string> = JSON.parse(
	fs.readFileSync(`${__dirname}/.tardisec.json`, "utf8"),
).http.headers;

const zoneId = new pulumi.Config().require("cloudflareZoneId");

export const tardisecHeaders = new cloudflare.Ruleset("tardisec-headers", {
	zoneId,
	name: "tardisec-headers",
	kind: "zone",
	phase: "http_response_headers_transform",
	rules: [
		{
			action: "rewrite",
			expression: "true",
			description: "tardisec reporting headers",
			actionParameters: {
				// set, not append: the origin's own weaker header loses to the synced one.
				headers: Object.fromEntries(
					Object.entries(headers).map(([name, value]) => [
						name,
						{ operation: "set", value },
					]),
				),
			},
		},
	],
});
