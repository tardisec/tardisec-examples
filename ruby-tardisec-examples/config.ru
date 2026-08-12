# frozen_string_literal: true

require "json"
require_relative "tardisec_middleware"

# Parsed once at boot, not per request; the file only changes via the sync workflow.
TARDISEC = JSON.parse(File.read(File.expand_path(".tardisec.json", __dir__)))

# The two lines to drop into your own config.ru, above `run YourApp`.
use Tardisec::Middleware, TARDISEC

run ->(_env) { [200, { "content-type" => "text/html" }, ["<!doctype html><title>ok</title>"]] }
