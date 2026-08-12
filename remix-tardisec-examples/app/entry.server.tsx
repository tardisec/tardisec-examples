import { RemixServer } from "@remix-run/react";
import type { EntryContext } from "@remix-run/node";
import { renderToString } from "react-dom/server";
import tardisecMiddleware from "./tardisecMiddleware";
import tardisec from "../.tardisec.json" with { type: "json" };

// entry.server, not root's `headers` export: the deepest matching route's `headers` wins in
// Remix, so a root-level export silently stops applying the moment any leaf defines its own.
// Here every document response goes through one place. Route headers still merge on top.
export default function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext,
) {
	const markup = renderToString(
		<RemixServer context={remixContext} url={request.url} />,
	);

	tardisecMiddleware(tardisec)(responseHeaders);
	responseHeaders.set("Content-Type", "text/html");

	return new Response(`<!DOCTYPE html>${markup}`, {
		status: responseStatusCode,
		headers: responseHeaders,
	});
}
