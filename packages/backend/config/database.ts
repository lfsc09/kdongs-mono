import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/lucid'
import env from '#start/env'

const dbConfig = defineConfig({
  /**
   * Default connection used for all queries.
   */
  connection: 'pg',

  connections: {
    /**
     * SQLite connection (default).
     */
    // sqlite: {
    //   client: 'better-sqlite3',

    //   connection: {
    //     filename: app.tmpPath('db.sqlite3'),
    //   },

    //   /**
    //    * Required by Knex for SQLite defaults.
    //    */
    //   useNullAsDefault: true,

    //   migrations: {
    //     /**
    //      * Sort migration files naturally by filename.
    //      */
    //     naturalSort: true,

    //     /**
    //      * Paths containing migration files.
    //      */
    //     paths: ['database/migrations'],
    //   },

    //   schemaGeneration: {
    //     /**
    //      * Enable schema generation from Lucid models.
    //      */
    //     enabled: true,

    //     /**
    //      * Custom schema rules file paths.
    //      */
    //     rulesPaths: ['./database/schema_rules.js'],
    //   },
    // },

    /**
     * PostgreSQL connection.
     * Install package to switch: npm install pg
     */
    pg: {
      client: 'pg',
      connection: {
        database: env.get('DB_DATABASE'),
        host: env.get('DB_HOST'),
        password: env.get('DB_PASSWORD'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
      },
      debug: app.inDev,
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      /**
       * TODO: Disable schema generation until it has better support/logic for column custom types like Big.js
       */
      schemaGeneration: {
        enabled: false,
      },
    },

    /**
     * MySQL / MariaDB connection.
     * Install package to switch: npm install mysql2
     */
    // mysql: {
    //   client: 'mysql2',
    //   connection: {
    //     host: env.get('DB_HOST'),
    //     port: env.get('DB_PORT'),
    //     user: env.get('DB_USER'),
    //     password: env.get('DB_PASSWORD'),
    //     database: env.get('DB_DATABASE'),
    //   },
    //   migrations: {
    //     naturalSort: true,
    //     paths: ['database/migrations'],
    //   },
    //   debug: app.inDev,
    // },

    /**
     * Microsoft SQL Server connection.
     * Install package to switch: npm install tedious
     */
    // mssql: {
    //   client: 'mssql',
    //   connection: {
    //     server: env.get('DB_HOST'),
    //     port: env.get('DB_PORT'),
    //     user: env.get('DB_USER'),
    //     password: env.get('DB_PASSWORD'),
    //     database: env.get('DB_DATABASE'),
    //   },
    //   migrations: {
    //     naturalSort: true,
    //     paths: ['database/migrations'],
    //   },
    //   debug: app.inDev,
    // },

    /**
     * libSQL (Turso) connection.
     * Install package to switch: npm install @libsql/client
     */
    // libsql: {
    //   client: 'libsql',
    //   connection: {
    //     url: env.get('LIBSQL_URL'),
    //     authToken: env.get('LIBSQL_AUTH_TOKEN'),
    //   },
    //   useNullAsDefault: true,
    //   migrations: {
    //     naturalSort: true,
    //     paths: ['database/migrations'],
    //   },
    //   debug: app.inDev,
    // },
  },
})

export default dbConfig
