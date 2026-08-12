import { createStart } from "@tanstack/react-start";
import tardisecMiddleware from "./tardisecMiddleware";
import tardisec from "../.tardisec.json" with { type: "json" };

// Creating src/start.ts opts you out of Start's automatic CSRF middleware for server
// functions, so add createCsrfMiddleware() here if you were relying on the default.
export const startInstance = createStart(() => ({
	requestMiddleware: [tardisecMiddleware(tardisec)],
}));
