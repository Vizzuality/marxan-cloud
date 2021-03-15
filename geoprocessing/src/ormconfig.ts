import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
<<<<<<< HEAD
import { AppConfig } from 'src/utils/config.utils';
=======
import { AppConfig } from 'utils/config.utils';
>>>>>>> WIP

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
export const geoprocessingConnections: {
  default: PostgresConnectionOptions;
  apiDB: PostgresConnectionOptions;
} = {
  default: {
    name: 'default',
    synchronize: false,
    type: 'postgres',
    url: AppConfig.get('postgresGeoApi.url'),
    ssl: false,
    entities: ['src/modules/**/*.geo.entity.ts'],
    // Logging may be: ['query', 'error', 'schema', 'warn', 'info', 'log'] Use
    // 'query' if needing to see the actual generated SQL statements (this should
    // be limited to `NODE_ENV=development`). Use 'error' for least verbose
    // logging.
    logging: ['error'],
    cache: false,
    migrations: ['src/migrations/geoprocessing/**/*.ts'],
<<<<<<< HEAD
    migrationsRun:
      AppConfig.get<string>(
        'postgresApi.runMigrationsOnStartup',
      )?.toLowerCase() !== 'false'
        ? true
        : false,
=======
<<<<<<< HEAD
    migrationsRun: true,
>>>>>>> WIP
    cli: {
      migrationsDir: 'src/migrations/geoprocessing',
    },
  },
  apiDB: {
    name: 'apiDB',
    synchronize: false,
    type: 'postgres',
<<<<<<< HEAD
    url: AppConfig.get('postgresApi.url'),
=======
    url: config.get('postgresApi.url'),
=======
    migrationsRun:  AppConfig.get<string>(
      'postgresApi.runMigrationsOnStartup',
    )?.toLowerCase() !== 'false'
      ? true
      : false,
    cli: {
      migrationsDir: "src/migrations/geoprocessing"
    }
  },
  apiDB: {
    name: "apiDB",
    synchronize: false,
    type: 'postgres',
    url: AppConfig.get('postgresApi.url'),
>>>>>>> WIP
>>>>>>> WIP
    ssl: false,
    entities: ['src/modules/**/*.api.entity.ts'],
    // Logging may be: ['query', 'error', 'schema', 'warn', 'info', 'log'] Use
    // 'query' if needing to see the actual generated SQL statements (this should
    // be limited to `NODE_ENV=development`). Use 'error' for least verbose
    // logging.
    logging: ['error'],
<<<<<<< HEAD
    cache: false,
=======
    cache: false
>>>>>>> WIP
  },
};
