# Demo app, wired the same way you'd wire it into your own FastAPI app.
import json
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import HTMLResponse

from tardisec_middleware import TardisecMiddleware

# Loaded once at import time, not per request; the file only changes via the sync workflow.
TARDISEC = json.loads((Path(__file__).parent / ".tardisec.json").read_text())

app = FastAPI()

# FastAPI inherits add_middleware from Starlette, so this is the same call and the same
# middleware class; only the app object above differs.
app.add_middleware(TardisecMiddleware, tardisec=TARDISEC)


@app.get("/", response_class=HTMLResponse)
async def homepage():
    return "<!doctype html><title>ok</title>"
