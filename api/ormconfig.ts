const config = require('config');

/**
 * @see https://typeorm.io/#/using-ormconfig/using-ormconfigjs
 *
 * If needing to set any of these parameters depending on environment, with
 * fallback for any other environment, we could use something like:
 *
 * ['staging', 'production'].includes(config.util.getEnv('NODE_ENV')) ? true : false
 */
module.exports = [
{ name: 'geoprocessingDB',
  connectionName: 'geoprocessingDB',
  synchronize: false,
  type: 'postgres',
  url: config.get('postgresGeoApi.url'),
  ssl: false,
  entities: ['src/modules/**/*.geo.entity.ts'],
  // Logging may be: ['query', 'error', 'schema', 'warn', 'info', 'log'] Use
  // 'query' if needing to see the actual generated SQL statements (this should
  // be limited to `NODE_ENV=development`). Use 'error' for least verbose
  // logging.
  logging: ['error'],
  cache: false,
  // migrations: ['src/migrations/geoprocessing/**/*.ts'],
  // Migrations will run automatically on startup, unless the
  // `API_RUN_MIGRATIONS_ON_STARTUP` environment variable is set and its value
  // matches, case-insensitively, the string `false`.
  // @debt I think this should be way more resilient to user input.
  // migrationsRun: config.get('postgresGeoApi.runMigrationsOnStartup')?.toLowerCase() !== 'false' ? true : false,,
  // cli: {
  //   migrationsDir: "src/migrations/geoprocessing",
  //   migrationsTableName: "migrations",
  // }
},
{name: 'default',
  connectionName: "default",
  synchronize: false,
  type: 'postgres',
  url: config.get('postgresApi.url'),
  ssl: false,
  entities: ['src/modules/**/*.api.entity.ts'],
  // Logging may be: ['query', 'error', 'schema', 'warn', 'info', 'log'] Use
  // 'query' if needing to see the actual generated SQL statements (this should
  // be limited to `NODE_ENV=development`). Use 'error' for least verbose
  // logging.
  logging: ['error'],
  cache: false,
  migrations: ['src/migrations/api/**/*.ts'],
  // See notes above in the other connection
  migrationsRun: config.get('postgresGeoApi.runMigrationsOnStartup')?.toLowerCase() !== 'false' ? true : false,
  cli: {
    migrationsDir: "src/migrations/api",
    migrationsTableName: "migrations",
  }
}];
