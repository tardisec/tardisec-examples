# Demo app, wired the same way you'd wire it into your own Starlette app.
import json
from pathlib import Path

from starlette.applications import Starlette
from starlette.responses import HTMLResponse
from starlette.routing import Route

from tardisec_middleware import TardisecMiddleware

# Loaded once at import time, not per request; the file only changes via the sync workflow.
TARDISEC = json.loads((Path(__file__).parent / ".tardisec.json").read_text())


async def homepage(_request):
    return HTMLResponse("<!doctype html><title>ok</title>")


# add_middleware instantiates the class per app with the keyword arguments given here, and
# keeps it in Starlette's own stack, so exception handling and routing stay inside it.
app = Starlette(routes=[Route("/", homepage)])
app.add_middleware(TardisecMiddleware, tardisec=TARDISEC)
