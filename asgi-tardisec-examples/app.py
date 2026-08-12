# Demo app, wired the same way you'd wire it into your own ASGI app. No framework here: an
# ASGI app is just a callable, and the middleware wraps it the same way whatever produced it.
import json
from pathlib import Path

from tardisec_middleware import TardisecMiddleware

# Loaded once at import time, not per request; the file only changes via the sync workflow.
TARDISEC = json.loads((Path(__file__).parent / ".tardisec.json").read_text())


async def homepage(scope, receive, send):
    await send(
        {
            "type": "http.response.start",
            "status": 200,
            "headers": [(b"content-type", b"text/html; charset=utf-8")],
        }
    )
    await send({"type": "http.response.body", "body": b"<!doctype html><title>ok</title>"})


app = TardisecMiddleware(homepage, TARDISEC)
