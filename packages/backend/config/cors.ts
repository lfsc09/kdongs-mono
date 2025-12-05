import { defineConfig } from '@adonisjs/cors'

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  credentials: true,
  enabled: true,
  exposeHeaders: [],
  headers: true,
  maxAge: 90,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
  origin: true,
})

export default corsConfig
