# ASGI middleware that layers .tardisec.json's http.headers onto every response.
# Takes the parsed manifest rather than reading the file, so this module is copy-paste
# portable and the app decides where .tardisec.json lives.


class TardisecMiddleware:
    """Wraps an ASGI app and adds the manifest's headers, skipping any the app already set."""

    def __init__(self, app, tardisec):
        self.app = app
        # http.response.start carries headers as a list of (bytes, bytes) tuples with lowercase
        # names, so encode and lowercase once here instead of on every response.
        self.headers = [
            (name.lower().encode("latin-1"), value.encode("latin-1"))
            for name, value in tardisec["http"]["headers"].items()
            if value
        ]

    async def __call__(self, scope, receive, send):
        # Only http scopes carry a response with headers; lifespan and websocket scopes
        # pass through untouched.
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        async def send_with_tardisec_headers(message):
            if message["type"] == "http.response.start":
                existing = {name for name, _value in message["headers"]}
                message["headers"] = [
                    *message["headers"],
                    *(pair for pair in self.headers if pair[0] not in existing),
                ]
            await send(message)

        await self.app(scope, receive, send_with_tardisec_headers)
