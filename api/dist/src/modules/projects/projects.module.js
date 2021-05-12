"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const projects_controller_1 = require("./projects.controller");
const project_api_entity_1 = require("./project.api.entity");
const projects_service_1 = require("./projects.service");
const users_module_1 = require("../users/users.module");
const scenarios_module_1 = require("../scenarios/scenarios.module");
const admin_areas_module_1 = require("../admin-areas/admin-areas.module");
const countries_module_1 = require("../countries/countries.module");
const planning_units_module_1 = require("../planning-units/planning-units.module");
const geo_features_module_1 = require("../geo-features/geo-features.module");
let ProjectsModule = class ProjectsModule {
};
ProjectsModule = __decorate([
    common_1.Module({
        imports: [
            admin_areas_module_1.AdminAreasModule,
            countries_module_1.CountriesModule,
            geo_features_module_1.GeoFeaturesModule,
            common_1.forwardRef(() => scenarios_module_1.ScenariosModule),
            typeorm_1.TypeOrmModule.forFeature([project_api_entity_1.Project]),
            users_module_1.UsersModule,
            planning_units_module_1.PlanningUnitsModule,
        ],
        providers: [projects_service_1.ProjectsService],
        controllers: [projects_controller_1.ProjectsController],
        exports: [projects_service_1.ProjectsService],
    })
], ProjectsModule);
exports.ProjectsModule = ProjectsModule;
//# sourceMappingURL=projects.module.js.map