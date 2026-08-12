import { defineNuxtConfig } from "nuxt/config";
import tardisec from "./.tardisec.nuxt.json" with { type: "json" };

// nuxt-security owns the enforce CSP: it injects the inline script/style hashes (or a
// nonce) that a static header can't carry. Every other header ships from the header map
// in server/middleware/tardisec.ts.
export default defineNuxtConfig({
	modules: ["nuxt-security"],
	security: tardisec.security,
});
