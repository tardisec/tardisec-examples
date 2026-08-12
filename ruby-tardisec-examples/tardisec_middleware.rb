# frozen_string_literal: true

module Tardisec
  # Rack middleware that layers .tardisec.json's http.headers onto every response, skipping
  # any header the wrapped app already set. Takes the parsed manifest rather than reading the
  # file, so this file is copy-paste portable and the app decides where .tardisec.json lives.
  class Middleware
    def initialize(app, tardisec)
      @app = app
      # Rack 3 requires response header names to be lowercase strings (the SPEC changed to match
      # HTTP/2, away from Rack 2's case-insensitive-but-usually-capitalized convention;
      # Rack::Lint rejects anything else). Downcasing the manifest's keys once here, at
      # construction rather than per request, keeps every header this middleware adds
      # spec-compliant without having to touch the manifest file itself.
      @headers = tardisec.fetch("http").fetch("headers")
        .each_with_object({}) { |(name, value), memo| memo[name.downcase] = value if value }
    end

    def call(env)
      status, headers, body = @app.call(env)
      # Downcase the app's own keys too before comparing, in case it predates Rack 3 and still
      # sets something like "Content-Type"; Rack::Lint would reject that key as-is anyway.
      existing = headers.keys.map(&:downcase)
      @headers.each { |name, value| headers[name] = value unless existing.include?(name) }
      [status, headers, body]
    end
  end
end
