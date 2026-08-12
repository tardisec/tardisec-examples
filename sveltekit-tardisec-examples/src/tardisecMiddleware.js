// Takes the parsed manifest rather than importing it, so this file is copy-paste portable and
// the app decides where .tardisec.json lives.
const tardisecMiddleware =
	(tardisec) =>
	async ({ event, resolve }) => {
		const response = await resolve(event);

		// Anything already on the response wins, which is what keeps this from clobbering the
		// hash-based CSP Kit just emitted from svelte.config.js.
		for (const [key, value] of Object.entries(tardisec.http.headers)) {
			if (value && !response.headers.has(key)) response.headers.set(key, value);
		}

		// Kit sets x-sveltekit-page: true on every rendered page (runtime/server/page/render.js).
		// It's an internal marker for adapters, of no use to a browser, and it tells anyone
		// watching exactly what framework this is. Drop it; delete is case-insensitive.
		response.headers.delete("X-Sveltekit-Page");

		// Kit refuses to emit require-trusted-types-for without a build-time trusted-types
		// allowlist, so .tardisec.sveltekit.json omits it and we append it to Kit's CSP here.
		// Same for the report-only header, which Kit emits from csp.reportOnly.
		for (const header of [
			"Content-Security-Policy",
			"Content-Security-Policy-Report-Only",
		]) {
			const csp = response.headers.get(header);
			if (csp && !csp.includes("require-trusted-types-for")) {
				response.headers.set(
					header,
					`${csp};require-trusted-types-for 'script'`,
				);
			}
		}

		return response;
	};

export default tardisecMiddleware;
