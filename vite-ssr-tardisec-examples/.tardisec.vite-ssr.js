// server.js: Vite SSR createServer({ server: { middlewareMode: true } })
import tardisec from "./.tardisec.json" with { type: "json" };

app.use((req, res, next) => {
  for (const [k, v] of Object.entries(tardisec.http.headers)) {
    res.setHeader(k, v);
  }
  next();
});