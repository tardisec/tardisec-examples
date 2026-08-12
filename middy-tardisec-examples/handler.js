import middy from "@middy/core";
import tardisec from "./.tardisec.json" with { type: "json" };
import tardisecMiddleware from "./tardisecMiddleware.js";

// Registered first on purpose: middy runs `after`/`onError` in reverse registration order,
// so first-registered runs last and sees the response every other middleware has finished
// with. Register it last and the next `after` in line can overwrite a security header.
export const handler = middy()
	.use(tardisecMiddleware(tardisec))
	.handler(async () => ({
		statusCode: 200,
		headers: { "Content-Type": "text/html" },
		body: "<!doctype html><title>ok</title>",
	}));
