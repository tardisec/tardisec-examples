// Command main demonstrates wiring a net/http server to its synced tardisec config.
package main

import (
	_ "embed"
	"encoding/json"
	"log"
	"net/http"
)

// Naming the file directly (not a directory pattern) sidesteps go:embed's dotfile exclusion:
// that rule only skips names starting with "." or "_" when a pattern matches a directory tree,
// not when a file is embedded by its literal name. Verified against go1.26.
//
//go:embed .tardisec.json
var manifestJSON []byte

func main() {
	// Parsed once at startup, not per request. A malformed manifest is a deploy problem, so
	// failing loudly here beats serving without the headers.
	var tardisec Manifest
	if err := json.Unmarshal(manifestJSON, &tardisec); err != nil {
		log.Fatalf("tardisec: parsing .tardisec.json: %v", err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		w.Write([]byte("<!doctype html><title>ok</title>"))
	})

	// Wrapping the mux means it runs before any route. A handler further down the chain can
	// still overwrite a header afterward, by calling Set again before it writes the body,
	// which is the escape hatch for one that genuinely needs its own.
	log.Fatal(http.ListenAndServe(":3000", TardisecMiddleware(tardisec)(mux)))
}
