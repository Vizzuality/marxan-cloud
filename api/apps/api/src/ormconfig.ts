import * as path from 'path';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { DbConnections } from './ormconfig.connections';
import { LoggerOptions } from 'typeorm';

/**
 * @see https://typeorm.io/#/using-ormconfig/using-ormconfigjs
 *
 * If needing to set any of these parameters depending on environment, with
 * fallback for any other environment, we could use something like:
 *
 * ['staging', 'production'].includes(config.util.getEnv('NODE_ENV')) ? true : false
 */

// Somehow, without type annotations here, the type checker complains about
// this data structure not matching that of `AuroraDataApiConnectionOptions`.
export const apiConnections: Record<
  DbConnections,
  PostgresConnectionOptions
> = {
  [DbConnections.default]: {
    // Could be named differently for it to be more descriptive, but keeping
    // this as `default` allows avoiding explicitly specifying the connection in
    // `TypeOrmModule.forFeature()`
    name: DbConnections.default,
    synchronize: false,
    type: 'postgres',
    username: AppConfig.get('postgresApi.username'),
    password: AppConfig.get('postgresApi.password'),
    port: AppConfig.get('postgresApi.port'),
    host: AppConfig.get('postgresApi.host'),
    database: AppConfig.get('postgresApi.database'),
    ssl: false,
    entities: [
      path.join(__dirname, '/modules/**/*.api.entity.{ts,js}'),
      path.join(__dirname, '../../../libs/**/*.api.entity.{ts,js}'),
    ],
    // Logging may be: ['query', 'error', 'schema', 'warn', 'info', 'log'] Use
    // 'query' if needing to see the actual generated SQL statements (this should
    // be limited to `NODE_ENV=development`). Use 'error' for least verbose
    // logging.
    logging: ['query', 'error', 'schema', 'warn', 'info', 'log'], // logging: `${AppConfig.get('postgresApi.logging')}`.split(
    //   ',',
    // ) as LoggerOptions,
    cache: false,
    migrations: [__dirname + '/migrations/api/**/*.ts'],
    /** Migrations will run automatically on startup, unless the
     * `API_RUN_MIGRATIONS_ON_STARTUP` or `GEOPROCESSING_RUN_MIGRATIONS_ON_STARTUP`
     * environment variables are set and their value matches, case-insensitively,
     * the string `false`.
     *
     * @debt I think this should be way more resilient to user input.
     */
    migrationsRun:
      `${AppConfig.get<string>(
        'postgresApi.runMigrationsOnStartup',
      )}`.toLowerCase() !== 'false',
    cli: {
      migrationsDir: 'apps/api/src/migrations/api',
    },
  },
  [DbConnections.geoprocessingDB]: {
    name: DbConnections.geoprocessingDB,
    synchronize: false,
    type: 'postgres',
    username: AppConfig.get('postgresGeoApi.username'),
    password: AppConfig.get('postgresGeoApi.password'),
    port: AppConfig.get('postgresGeoApi.port'),
    host: AppConfig.get('postgresGeoApi.host'),
    database: AppConfig.get('postgresGeoApi.database'),
    ssl: false,
    entities: [
      path.join(__dirname, '/modules/**/*.geo.entity.{ts,js}'),
      path.join(__dirname, '../../../libs/**/*.geo.entity.{ts,js}'),
    ],
    logging: `${AppConfig.get('postgresGeoApi.logging')}`.split(
      ',',
    ) as LoggerOptions,
    cache: false,
    // Migrations for this db/data source are handled in the geoprocessing
    // service
  },
};
