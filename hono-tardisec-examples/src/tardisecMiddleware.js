// Takes the parsed manifest rather than importing it, so this file is copy-paste portable and
// the app decides where .tardisec.json lives.
const tardisecMiddleware = (tardisec) => async (c, next) => {
	// await next() first so c.res is the final response, not whatever a handler set before it
	// finished.
	await next();
	for (const [key, value] of Object.entries(tardisec.http.headers)) {
		if (value && !c.res.headers.has(key)) c.res.headers.set(key, value);
	}
};

export default tardisecMiddleware;
