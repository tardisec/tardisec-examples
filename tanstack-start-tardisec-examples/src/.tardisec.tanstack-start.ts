// src/start.ts
import { createMiddleware, createStart } from "@tanstack/react-start";
import { setResponseHeaders } from "@tanstack/react-start/server";
import tardisec from "../.tardisec.json";

const securityHeaders = createMiddleware().server(({ next }) => {
  setResponseHeaders(new Headers(tardisec.http.headers));
  return next();
});

export const startInstance = createStart(() => ({
  requestMiddleware: [securityHeaders],
}));