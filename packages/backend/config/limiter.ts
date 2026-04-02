import { defineConfig, stores } from '@adonisjs/limiter'
import env from '#start/env'

const limiterConfig = defineConfig({
  default: env.get('LIMITER_STORE'),
  stores: {
    /**
     * Memory store could be used during
     * testing
     */
    memory: stores.memory({
      keyPrefix: 'rate_limit',
    }),

    /**
     * Redis store to save rate limiting data inside a
     * redis database.
     *
     * It is recommended to use a separate database for
     * the limiter connection.
     */
    redis: stores.redis({
      connectionName: 'main',
      keyPrefix: 'rate_limit',
      // Turn on, if rejections when redis not ready are building up and causing memory leaks
      rejectIfRedisNotReady: false,
    }),
  },
})

export default limiterConfig

declare module '@adonisjs/limiter/types' {
  export interface LimitersList extends InferLimiters<typeof limiterConfig> {}
}
