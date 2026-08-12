import tardisecMiddleware from "../utils/tardisecMiddleware";
import tardisec from "../../.tardisec.json" with { type: "json" };

// Nitro auto-registers every file in server/middleware/ as global middleware, so the reusable
// factory lives in server/utils/tardisecMiddleware.ts instead; this file only wires it up.
export default tardisecMiddleware(tardisec);
