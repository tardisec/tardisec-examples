// Takes the parsed manifest rather than importing it, so this file is copy-paste portable and
// the app decides where .tardisec.json lives.
const tardisecMiddleware = (tardisec) => (_req, res, next) => {
	// Running first means the getHeader guard only defers to middleware mounted above it;
	// anything downstream can still overwrite a header, which is the escape hatch for a route
	// that needs its own.
	for (const [key, value] of Object.entries(tardisec.http.headers)) {
		if (value && !res.getHeader(key)) res.setHeader(key, value);
	}
	next();
};

export default tardisecMiddleware;
