import manifest from "../.tardisec.json" with { type: "json" };

const VERIFICATION_FILE = "tardisec-verification.txt";
const VERIFICATION_PATH = `/.well-known/${VERIFICATION_FILE}`;
const verificationId = manifest[".well-known"]?.[VERIFICATION_FILE];

export default {
	async fetch(request) {
		// The platform behind this Worker has no route for the verification file, so the
		// Worker is what proves domain ownership over HTTP (RFC 8615).
		if (verificationId && new URL(request.url).pathname === VERIFICATION_PATH) {
			return new Response(verificationId, {
				headers: { "content-type": "text/plain; charset=utf-8" },
			});
		}

		// Goes to the zone's origin, not back through this route: Cloudflare does not
		// re-invoke a Worker for its own subrequest.
		const response = await fetch(request);
		const proxied = new Response(response.body, response);
		for (const [name, value] of Object.entries(manifest.http.headers)) {
			// set, not append: overriding the platform's own weak header is the whole point.
			proxied.headers.set(name, value);
		}
		return proxied;
	},
};
