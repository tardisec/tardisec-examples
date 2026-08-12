import tardisec from "../.tardisec.json" with { type: "json" };
import tardisecMiddleware from "./tardisecMiddleware.js";

// One hook, so it's exported directly. Alongside your own hooks it goes in a sequence():
//   import { sequence } from "@sveltejs/kit/hooks";
//   export const handle = sequence(tardisecMiddleware(tardisec), yourOtherHook);
export const handle = tardisecMiddleware(tardisec);
