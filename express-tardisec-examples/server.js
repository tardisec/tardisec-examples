import express from "express";
import tardisec from "./.tardisec.json" with { type: "json" };
import tardisecMiddleware from "./tardisecMiddleware.js";

const app = express();

// Mounted ahead of every route so it covers all of them, including a response sent
// directly with res.send/res.end.
app.use(tardisecMiddleware(tardisec));

app.get("/", (_req, res) => {
	res.send("<!doctype html><title>ok</title>");
});

app.listen(3000);
