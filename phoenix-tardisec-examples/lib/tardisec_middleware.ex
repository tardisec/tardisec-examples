defmodule TardisecMiddleware do
  @moduledoc false
  @behaviour Plug

  @manifest_path Path.expand("../.tardisec.json", __DIR__)

  # Tracked so `mix compile` recompiles this module when the synced manifest changes, even
  # though no line of Elixir source did. Without this the old header map stays baked in until
  # something else touches this file.
  @external_resource @manifest_path

  # Unlike the other examples, the manifest is not passed in: baking it into a module attribute
  # at compile time is the idiomatic Elixir equivalent, and it is what buys the recompilation
  # tracking above. Pass a path through `init/1` instead if you need it configurable per env.
  @tardisec_headers @manifest_path
                    |> File.read!()
                    |> Jason.decode!()
                    |> get_in(["http", "headers"])

  @impl Plug
  def init(opts), do: opts

  # Plug requires lowercase response header names. HTTP/1.1 tolerates any casing, but HTTP/2
  # does not (RFC 7540 8.1.2), and clients drop a response with mixed-case headers outright
  # rather than normalizing it; Plug.Adapters.Conn.Test raises Plug.Conn.InvalidHeaderError on
  # a mixed-case key so this shows up in dev instead of as a silently dropped response in
  # production. The manifest's keys are Title-Case, so downcase before comparing or writing.
  @impl Plug
  def call(conn, _opts) do
    Enum.reduce(@tardisec_headers, conn, fn {key, value}, conn ->
      key = String.downcase(key)

      if value not in [nil, ""] and Plug.Conn.get_resp_header(conn, key) == [] do
        Plug.Conn.put_resp_header(conn, key, value)
      else
        conn
      end
    end)
  end
end
