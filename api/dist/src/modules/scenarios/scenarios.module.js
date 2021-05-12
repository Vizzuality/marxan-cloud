"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScenariosModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const scenarios_controller_1 = require("./scenarios.controller");
const scenario_api_entity_1 = require("./scenario.api.entity");
const scenarios_service_1 = require("./scenarios.service");
const users_module_1 = require("../users/users.module");
const project_api_entity_1 = require("../projects/project.api.entity");
const protected_areas_module_1 = require("../protected-areas/protected-areas.module");
const projects_module_1 = require("../projects/projects.module");
const scenarios_features_1 = require("../scenarios-features");
const proxy_service_1 = require("../proxy/proxy.service");
const wdpa_area_calculation_service_1 = require("./wdpa-area-calculation.service");
let ScenariosModule = class ScenariosModule {
};
ScenariosModule = __decorate([
    common_1.Module({
        imports: [
            protected_areas_module_1.ProtectedAreasModule,
            common_1.forwardRef(() => projects_module_1.ProjectsModule),
            typeorm_1.TypeOrmModule.forFeature([project_api_entity_1.Project, scenario_api_entity_1.Scenario]),
            users_module_1.UsersModule,
            scenarios_features_1.ScenarioFeaturesModule,
        ],
        providers: [scenarios_service_1.ScenariosService, proxy_service_1.ProxyService, wdpa_area_calculation_service_1.WdpaAreaCalculationService],
        controllers: [scenarios_controller_1.ScenariosController],
        exports: [scenarios_service_1.ScenariosService],
    })
], ScenariosModule);
exports.ScenariosModule = ScenariosModule;
//# sourceMappingURL=scenarios.module.js.map