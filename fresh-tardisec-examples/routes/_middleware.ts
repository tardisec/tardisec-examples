import tardisec from "../.tardisec.json" with { type: "json" };
import { define } from "../utils.ts";
import tardisecMiddleware from "../tardisecMiddleware.ts";

// At routes/ root this applies site-wide.
export default define.middleware(tardisecMiddleware(tardisec));
