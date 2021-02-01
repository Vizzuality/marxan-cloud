import { apiConnections } from "ormconfig";

/**
 * We just re-export what we import from the actual ORM configuration file
 * within the NestJS app.
 *
 * This is so we can reuse the same configuration in `AppModule`
 * (`TypeOrmModule.forRoot()` imports for both connections in use in the API)
 * and as an `ormconfig.ts` file which can be found by the TypeORM CLI utility
 * without having to explicitly tell it from which file to load the ORM
 * configuration from.
 */
module.exports = [
  apiConnections.default,
  apiConnections.geoprocessingDB
];