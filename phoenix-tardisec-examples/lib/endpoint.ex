defmodule MyAppWeb.Endpoint do
  @moduledoc false
  use Phoenix.Endpoint, otp_app: :my_app

  # Wiring only: where TardisecPlug goes in a Phoenix endpoint, and why there.
  #
  # Ahead of Plug.Static, so the headers are on the files it serves too. Plug.Static halts the
  # pipeline once it answers, and a halt keeps whatever is already on conn.resp_headers, so
  # anything mounted after it never sees a static response.
  plug TardisecMiddleware

  plug Plug.Static,
    at: "/",
    from: :my_app,
    gzip: false,
    only: MyAppWeb.static_paths()

  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()

  plug Plug.MethodOverride
  plug Plug.Head
  plug Plug.Session, store: :cookie, key: "_my_app_key", signing_salt: "changeme"
  plug MyAppWeb.Router
end
