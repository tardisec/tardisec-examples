type Manifest = { http: { headers: Record<string, string> } };

// Takes the parsed manifest rather than importing it, so this file is copy-paste portable and
// the app decides where .tardisec.json lives.
const tardisecMiddleware =
	(tardisec: Manifest) => (responseHeaders: Headers) => {
		for (const [key, value] of Object.entries(tardisec.http.headers)) {
			if (value && !responseHeaders.has(key)) responseHeaders.set(key, value);
		}
	};

export default tardisecMiddleware;
