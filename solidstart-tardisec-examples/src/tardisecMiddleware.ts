type Manifest = { http: { headers: Record<string, string> } };

// Takes the parsed manifest rather than importing it, so this file is copy-paste portable and
// the app decides where .tardisec.json lives.
// event is typed structurally, by the one thing this uses, rather than importing SolidStart's
// own event type: it keeps the file dependency-free and still type-checks under strict.
const tardisecMiddleware =
	(tardisec: Manifest) => (event: { response: { headers: Headers } }) => {
		for (const [key, value] of Object.entries(tardisec.http.headers)) {
			if (value && !event.response.headers.has(key)) {
				event.response.headers.set(key, value);
			}
		}
	};

export default tardisecMiddleware;
