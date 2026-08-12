// Takes the parsed manifest rather than importing it, so this file is copy-paste portable and
// the app decides where .tardisec.json lives.
const tardisecMiddleware = (tardisec) => {
	// Everything except the enforce CSP, which astro.config.mjs owns. Astro emits its policy as
	// a <meta> tag, so there is no header here to collide with and nothing to skip it for us:
	// sending the header map's hash-less copy too would intersect with the meta policy and
	// block the very inline scripts Astro just hashed.
	const headers = Object.entries(tardisec.http.headers).filter(
		([key]) => key !== "Content-Security-Policy",
	);

	return async (_context, next) => {
		const response = await next();
		for (const [key, value] of headers) {
			if (value && !response.headers.has(key)) response.headers.set(key, value);
		}
		return response;
	};
};

export default tardisecMiddleware;
