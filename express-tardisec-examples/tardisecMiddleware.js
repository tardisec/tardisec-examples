// Takes the parsed manifest rather than importing it, so this file is copy-paste portable and
// the app decides where .tardisec.json lives.
const tardisecMiddleware = (tardisec) => (_req, res, next) => {
	// Because it runs first, the getHeader guard only defers to middleware mounted above it; a
	// route can still overwrite a header afterwards, which is the escape hatch for one that
	// genuinely needs its own. getHeader is case-insensitive, so the guard holds however the
	// other side cased the key.
	for (const [key, value] of Object.entries(tardisec.http.headers)) {
		if (value && !res.getHeader(key)) res.setHeader(key, value);
	}
	next();
};

export default tardisecMiddleware;
