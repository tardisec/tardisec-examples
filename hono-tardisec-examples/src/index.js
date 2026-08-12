import { Hono } from "hono";
import tardisec from "../.tardisec.json" with { type: "json" };
import tardisecMiddleware from "./tardisecMiddleware.js";

const app = new Hono();

// Register before any route: Hono matches in registration order, so a route defined
// above this call never runs through it.
app.use("*", tardisecMiddleware(tardisec));

app.get("/", (c) => c.html("<!doctype html><title>ok</title>"));

export default app;
