type Manifest = { http: { headers: Record<string, string> } };

// Takes the parsed manifest rather than importing it, so this file is copy-paste portable and
// the app decides where .tardisec.json lives.
const tardisecMiddleware = (tardisec: Manifest) => {
	// Everything except the enforce CSP, which nuxt-security owns (nuxt.config.ts).
	// nuxt-security also emits its own defaults for some of these; set the matching
	// `security.headers.<camelCaseName>: false` for any header you want the map to own.
	const headers = Object.entries(tardisec.http.headers).filter(
		([key]) => key !== "Content-Security-Policy",
	);

	return defineEventHandler((event) => {
		for (const [key, value] of headers) {
			if (value) setResponseHeader(event, key, value);
		}
	});
};

export default tardisecMiddleware;
