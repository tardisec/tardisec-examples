// next.config.js
const tardisec = require("./.tardisec.json");
const headers = tardisec.http.headers;
module.exports = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: Object.entries(headers).map(([key, value]) => ({ key, value })),
      },
    ];
  },
};