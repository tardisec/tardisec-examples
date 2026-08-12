// src/middleware.ts: defineConfig({ middleware: "./src/middleware.ts" }) in app.config.ts
import { createMiddleware } from "@solidjs/start/middleware";
import tardisec from "../.tardisec.json";

export default createMiddleware({
  onBeforeResponse: (event) => {
    for (const [k, v] of Object.entries(tardisec.http.headers)) {
      event.response.headers.set(k, v);
    }
  },
});