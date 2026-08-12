import fs from 'node:fs'
import path from 'node:path'

import type { FastifyInstance } from 'fastify'

import { createServer } from '@redwoodjs/api-server'
import { getPaths } from '@redwoodjs/project-config'

import { logger } from 'src/lib/logger'
import tardisecMiddleware from 'src/lib/tardisecMiddleware'

// getPaths().base is Redwood's own project-root path, more reliable here than __dirname or
// process.cwd(): the compiled server file runs from api/dist, not api/src, and cwd depends on
// how the process was launched, but base always resolves to the project root.
const tardisec = JSON.parse(
  fs.readFileSync(path.join(getPaths().base, '.tardisec.json'), 'utf8'),
)

async function configureApiServer(server: FastifyInstance) {
  server.addHook('onSend', tardisecMiddleware(tardisec))
}

async function main() {
  const server = await createServer({
    logger,
    configureApiServer,
  })

  await server.start()
}

main()
