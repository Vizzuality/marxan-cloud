"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiConnections = void 0;
const config_utils_1 = require("./utils/config.utils");
const ormconfig_connections_1 = require("./ormconfig.connections");
exports.apiConnections = {
    [ormconfig_connections_1.DbConnections.default]: {
        name: ormconfig_connections_1.DbConnections.default,
        synchronize: false,
        type: 'postgres',
        url: config_utils_1.AppConfig.get('postgresApi.url'),
        ssl: false,
        entities: [__dirname + '/modules/**/*.api.entity.{ts,js}'],
        logging: ['error'],
        cache: false,
        migrations: [__dirname + '/migrations/api/**/*.ts'],
        migrationsRun: ((_a = config_utils_1.AppConfig.get('postgresApi.runMigrationsOnStartup')) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== 'false'
            ? true
            : false,
        cli: {
            migrationsDir: 'migrations/api',
        },
    },
    [ormconfig_connections_1.DbConnections.geoprocessingDB]: {
        name: ormconfig_connections_1.DbConnections.geoprocessingDB,
        synchronize: false,
        type: 'postgres',
        url: config_utils_1.AppConfig.get('postgresGeoApi.url'),
        ssl: false,
        entities: [__dirname + '/modules/**/*.geo.entity.{ts,js}'],
        logging: ['error'],
        cache: false,
    },
};
//# sourceMappingURL=ormconfig.js.map