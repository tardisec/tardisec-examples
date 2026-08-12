import { createMiddleware } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

type Manifest = { http: { headers: Record<string, string> } };

// Takes the parsed manifest rather than importing it, so this file is copy-paste portable and
// the app decides where .tardisec.json lives.
const tardisecMiddleware = (tardisec: Manifest) =>
	// setResponseHeader one at a time, not setResponseHeaders(new Headers(...)): the bulk
	// setter is reported not to apply from global request middleware
	// (https://github.com/TanStack/router/issues/5407). Verify the headers land on a real
	// response before trusting this. If they don't, apply the map at your host instead
	// (.tardisec.nginx.conf / .tardisec.caddyfile are drop-ins).
	createMiddleware().server(({ next }) => {
		for (const [key, value] of Object.entries(tardisec.http.headers)) {
			if (value) setResponseHeader(key, value);
		}
		return next();
	});

export default tardisecMiddleware;
