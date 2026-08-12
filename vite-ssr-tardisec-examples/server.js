import express from "express";
import { createServer as createViteServer } from "vite";
import tardisec from "./.tardisec.json" with { type: "json" };
import tardisecMiddleware from "./tardisecMiddleware.js";

const app = express();
const vite = await createViteServer({
	server: { middlewareMode: true },
	appType: "custom",
});

// Ahead of vite.middlewares so the headers cover assets and the SSR render alike.
app.use(tardisecMiddleware(tardisec));

app.use(vite.middlewares);

app.listen(5173);
