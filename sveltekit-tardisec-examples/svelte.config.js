import adapter from "@sveltejs/adapter-auto";
import tardisec from "./.tardisec.sveltekit.json" with { type: "json" };

// kit.csp comes straight from the synced file: Kit hashes your inline scripts/styles at
// build time, which a static header can't do. Every other header ships via src/hooks.server.js.
export default {
	kit: {
		adapter: adapter(),
		csp: tardisec.kit.csp,
		subresourceIntegrity: "sha384",
	},
};
