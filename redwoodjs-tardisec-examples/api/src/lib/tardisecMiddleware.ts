import type { FastifyReply, FastifyRequest } from 'fastify'

type Manifest = { http: { headers: Record<string, string> } }

// Takes the parsed manifest rather than importing it, so this file is copy-paste portable and
// the app decides where .tardisec.json lives.
const tardisecMiddleware =
  (tardisec: Manifest) =>
  // configureApiServer hands over the raw Fastify instance before Redwood's own API plugin
  // registers, which is the only supported place to add a hook like this. onSend runs after a
  // function or GraphQL resolver builds its response but before it goes over the wire, so it
  // also covers thrown errors and GraphQL error payloads, not just the 200 path. hasHeader
  // lets a function that already set its own value for a key win.
  async (_request: FastifyRequest, reply: FastifyReply, payload: unknown) => {
    for (const [key, value] of Object.entries(tardisec.http.headers)) {
      if (value && !reply.hasHeader(key)) reply.header(key, value)
    }

    return payload
  }

export default tardisecMiddleware
