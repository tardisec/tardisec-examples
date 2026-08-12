type Manifest = { http: { headers: Record<string, string> } };

// Takes the parsed manifest rather than importing it, so this file is copy-paste portable and
// the app decides where .tardisec.json lives.
//
// Lives at the project root, not in routes/: Fresh's file-based router turns every file in
// routes/ that isn't underscore-prefixed into a route mapped to its filename regardless of
// what it exports, so routes/tardisecMiddleware.ts would register as GET /tardisecMiddleware.
// ctx is typed structurally, by the one thing this uses, rather than importing Fresh's own
// context type: it keeps the file dependency-free and still type-checks under strict.
const tardisecMiddleware =
	(tardisec: Manifest) => async (ctx: { next: () => Promise<Response> }) => {
		const response = await ctx.next();

		// Deno Fresh has no build-time CSP hashing, so the enforce policy ships as-is; Fresh's
		// islands bootstrap is an external module, which `script-src-elem 'self'` already covers.
		// Anything already set wins, so a route that sets its own header keeps it.
		for (const [key, value] of Object.entries(tardisec.http.headers)) {
			if (value && !response.headers.has(key)) response.headers.set(key, value);
		}
		return response;
	};

export default tardisecMiddleware;
