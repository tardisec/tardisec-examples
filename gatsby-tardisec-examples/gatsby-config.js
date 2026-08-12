const tardisec = require("./.tardisec.json");
const csp = require("./.tardisec.gatsby.json");

// gatsby-plugin-csp owns the enforce CSP: it merges the inline script/style hashes into
// a <meta> tag at build time. Sending the header map's hash-less copy as well would
// intersect with that policy and block the scripts it just hashed, so it's dropped here.
const headers = Object.entries(tardisec.http.headers)
	.filter(([key]) => key !== "Content-Security-Policy")
	.map(([key, value]) => ({ key, value }));

// `headers` needs gatsby@5.12 and an adapter whose host supports them (gatsby-adapter-netlify,
// Vercel, …). On a plain `gatsby serve` or an unsupported host, apply the map at the host
// instead: .tardisec.nginx.conf / .tardisec.caddyfile are drop-ins for that.
module.exports = {
	plugins: [csp],
	headers: [{ source: "/*", headers }],
};
