import manifest from "../.tardisec.json" with { type: "json" };

// Pages Functions run in front of everything the project serves, static assets included, so
// this one file covers the whole site. A `_headers` file would only cover the static output.
export async function onRequest(context) {
	const response = await context.next();
	for (const [name, value] of Object.entries(manifest.http.headers)) {
		// set, not append: the framework's own weaker header loses to the synced one.
		response.headers.set(name, value);
	}
	return response;
}
