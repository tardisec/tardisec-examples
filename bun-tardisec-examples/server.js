import tardisec from "./.tardisec.json" with { type: "json" };
import tardisecMiddleware from "./tardisecMiddleware.js";

const withTardisecHeaders = tardisecMiddleware(tardisec);

Bun.serve({
	port: 3000,
	fetch(_req) {
		const response = new Response("<!doctype html><title>ok</title>", {
			headers: { "Content-Type": "text/html" },
		});
		return withTardisecHeaders(response);
	},
});
