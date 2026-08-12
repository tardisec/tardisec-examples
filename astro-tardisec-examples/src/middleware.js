import tardisec from "../.tardisec.json" with { type: "json" };
import tardisecMiddleware from "./tardisecMiddleware.js";

// src/middleware.js is the filename Astro loads, so the wiring lives here and the reusable
// part sits next to it. Alongside your own middleware, use Astro's sequence():
//   import { sequence } from "astro:middleware";
//   export const onRequest = sequence(tardisecMiddleware(tardisec), yourOtherMiddleware);
export const onRequest = tardisecMiddleware(tardisec);
