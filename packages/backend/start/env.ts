/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  APP_KEY: Env.schema.secret(),
  APP_URL: Env.schema.string({ format: 'url', tld: false }),
  CORS_ORIGIN: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PASSWORD: Env.schema.string(),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LIMITER_STORE: Env.schema.enum(['redis', 'memory'] as const),
  LOG_LEVEL: Env.schema.string(),
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  REDIS_CONNECTION: Env.schema.enum(['main', 'test'] as const),
  REDIS_HOST: Env.schema.string({ format: 'host' }),
  REDIS_PASSWORD: Env.schema.secret.optional(),
  REDIS_PORT: Env.schema.number(),
})
