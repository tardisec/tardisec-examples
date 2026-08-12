import { createMiddleware } from "@solidjs/start/middleware";
import tardisecMiddleware from "./tardisecMiddleware";
import tardisec from "../.tardisec.json" with { type: "json" };

// onBeforeResponse, so the headers land on the finished response. Register the file in
// app.config.ts or none of this runs.
export default createMiddleware({
	onBeforeResponse: tardisecMiddleware(tardisec),
});
