"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const typeorm_1 = require("@nestjs/typeorm");
const authentication_module_1 = require("./modules/authentication/authentication.module");
const countries_module_1 = require("./modules/countries/countries.module");
const scenarios_module_1 = require("./modules/scenarios/scenarios.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const ping_controller_1 = require("./modules/ping/ping.controller");
const projects_module_1 = require("./modules/projects/projects.module");
const users_module_1 = require("./modules/users/users.module");
const geo_module_1 = require("./modules/geo/geo.module");
const geo_features_module_1 = require("./modules/geo-features/geo-features.module");
const ormconfig_1 = require("./ormconfig");
const organizations_module_1 = require("./modules/organizations/organizations.module");
const nestjs_base_service_1 = require("nestjs-base-service");
const core_1 = require("@nestjs/core");
const all_exceptions_exception_filter_1 = require("./filters/all-exceptions.exception.filter");
const admin_areas_module_1 = require("./modules/admin-areas/admin-areas.module");
const api_events_module_1 = require("./modules/api-events/api-events.module");
const protected_areas_module_1 = require("./modules/protected-areas/protected-areas.module");
const proxy_module_1 = require("./modules/proxy/proxy.module");
const scenarios_planning_unit_module_1 = require("./modules/scenarios-planning-unit/scenarios-planning-unit.module");
const planning_units_protection_level_module_1 = require("./modules/planning-units-protection-level/planning-units-protection-level.module");
const analysis_module_1 = require("./modules/analysis/analysis.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(nestjs_base_service_1.FetchSpecificationMiddleware)
            .forRoutes({ path: '*', method: common_1.RequestMethod.GET });
    }
};
AppModule = __decorate([
    common_1.Module({
        imports: [
            typeorm_1.TypeOrmModule.forRoot(Object.assign(Object.assign({}, ormconfig_1.apiConnections.default), { keepConnectionAlive: true })),
            typeorm_1.TypeOrmModule.forRoot(Object.assign(Object.assign({}, ormconfig_1.apiConnections.geoprocessingDB), { keepConnectionAlive: true })),
            cqrs_1.CqrsModule,
            admin_areas_module_1.AdminAreasModule,
            api_events_module_1.ApiEventsModule,
            countries_module_1.CountriesModule,
            geo_module_1.GeoModule,
            geo_features_module_1.GeoFeaturesModule,
            organizations_module_1.OrganizationsModule,
            projects_module_1.ProjectsModule,
            protected_areas_module_1.ProtectedAreasModule,
            scenarios_module_1.ScenariosModule,
            users_module_1.UsersModule,
            authentication_module_1.AuthenticationModule,
            proxy_module_1.ProxyModule,
            scenarios_planning_unit_module_1.ScenariosPlanningUnitModule,
            planning_units_protection_level_module_1.PlanningUnitsProtectionLevelModule,
            analysis_module_1.AnalysisModule,
        ],
        controllers: [app_controller_1.AppController, ping_controller_1.PingController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_FILTER,
                useClass: all_exceptions_exception_filter_1.AllExceptionsFilter,
            },
        ],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map