package main

import "net/http"

// Manifest is the slice of .tardisec.json this middleware needs.
type Manifest struct {
	HTTP struct {
		Headers map[string]string `json:"headers"`
	} `json:"http"`
}

// TardisecMiddleware takes the parsed manifest rather than reading the file itself, so this
// file is copy-paste portable and the caller decides where .tardisec.json comes from.
func TardisecMiddleware(tardisec Manifest) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// http.Header.Get/Set canonicalize the key, so this guard is case-insensitive
			// regardless of how the manifest or a handler cased it. Map iteration order is
			// random, but header order carries no meaning over HTTP, so that's fine.
			header := w.Header()
			for key, value := range tardisec.HTTP.Headers {
				if value != "" && header.Get(key) == "" {
					header.Set(key, value)
				}
			}
			next.ServeHTTP(w, r)
		})
	}
}
