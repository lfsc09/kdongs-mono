import { defineConfig } from '@adonisjs/lucid'
import env from '#start/env'

const dbConfig = defineConfig({
  connection: 'postgres',
  connections: {
    postgres: {
      client: 'pg',
      connection: {
        database: env.get('DB_DATABASE'),
        host: env.get('DB_HOST'),
        password: env.get('DB_PASSWORD'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig
