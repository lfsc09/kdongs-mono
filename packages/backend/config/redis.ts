import { defineConfig } from '@adonisjs/redis'
import { InferConnections } from '@adonisjs/redis/types'
import env from '#start/env'

const redisConfig = defineConfig({
  connection: env.get('REDIS_CONNECTION', 'main'),

  connections: {
    /*
    |--------------------------------------------------------------------------
    | The default connection
    |--------------------------------------------------------------------------
    |
    | The main connection you want to use to execute redis commands. The same
    | connection will be used by the session provider, if you rely on the
    | redis driver.
    |
    */
    main: {
      db: 0,
      host: env.get('REDIS_HOST'),
      keyPrefix: '',
      password: env.get('REDIS_PASSWORD', ''),
      port: env.get('REDIS_PORT'),
      // Stop after 10 attempts, with exponential backoff: 50ms, 100ms, 150ms, etc.
      retryStrategy(times) {
        return times > 10 ? null : times * 50
      },
    },

    test: {
      db: 1,
      host: env.get('REDIS_HOST'),
      keyPrefix: '',
      password: env.get('REDIS_PASSWORD', ''),
      port: env.get('REDIS_PORT'),
      // Stop after 10 attempts, with exponential backoff: 50ms, 100ms, 150ms, etc.
      retryStrategy(times) {
        return times > 3 ? null : times * 50
      },
    },
  },
})

export default redisConfig

declare module '@adonisjs/redis/types' {
  export interface RedisConnections extends InferConnections<typeof redisConfig> {}
}
