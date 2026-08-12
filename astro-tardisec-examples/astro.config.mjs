import { defineConfig } from "astro/config";
import tardisec from "./.tardisec.astro.json" with { type: "json" };

// The synced file is already shaped as Astro's config, so it spreads in as-is.
// Astro hashes your inline scripts and styles at build time and emits the enforce policy
// itself, so it must come from here and not from the header map.
// Needs astro@6; on 5.9-5.x move the same object to experimental.csp.
export default defineConfig({
	...tardisec,
});
