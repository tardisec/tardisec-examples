const tardisec = require("./.tardisec.json");

// Next has no build-time CSP hashing, so the enforce policy ships as-is. `script-src-elem
// 'self'` covers your bundles, but Next's inline bootstrap needs a nonce, see README.
const headers = Object.entries(tardisec.http.headers).map(([key, value]) => ({
	key,
	value,
}));

module.exports = {
	async headers() {
		return [{ source: "/:path*", headers }];
	},
};
