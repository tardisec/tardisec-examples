// Takes the parsed manifest rather than importing it, so this file is copy-paste portable and
// the app decides where .tardisec.json lives.
const tardisecMiddleware = (tardisec) => {
	// Wraps whatever a route builds, so every response gets the headers no matter how it was
	// constructed. response.headers is a Fetch API Headers object; already-set entries win.
	function withTardisecHeaders(response) {
		for (const [key, value] of Object.entries(tardisec.http.headers)) {
			if (value && !response.headers.has(key)) response.headers.set(key, value);
		}
		return response;
	}
	return withTardisecHeaders;
};

export default tardisecMiddleware;
