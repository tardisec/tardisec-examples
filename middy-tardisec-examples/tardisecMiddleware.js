// Takes the parsed manifest rather than importing it, so this file is copy-paste portable and
// the app decides where .tardisec.json lives.
const tardisecMiddleware = (tardisec) => {
	// `onError` as well as `after`, or a thrown handler skips the whole chain and the error
	// response ships bare, and an error page is still a page a browser parses.
	const apply = (request) => {
		const response = request.response;
		if (!response || typeof response !== "object") return;
		const headers = (response.headers ??= {});
		// API Gateway response header keys are whatever the handler typed, so compare
		// case-insensitively: a handler that set its own Content-Type keeps it.
		const present = new Set(Object.keys(headers).map((k) => k.toLowerCase()));
		for (const [key, value] of Object.entries(tardisec.http.headers)) {
			if (value && !present.has(key.toLowerCase())) headers[key] = value;
		}
	};

	return { after: apply, onError: apply };
};

export default tardisecMiddleware;
