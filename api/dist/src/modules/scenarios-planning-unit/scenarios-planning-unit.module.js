"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScenariosPlanningUnitModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const remote_connection_name_1 = require("./entities/remote-connection-name");
const scenarios_planning_unit_geo_entity_1 = require("./entities/scenarios-planning-unit.geo.entity");
const scenarios_planning_unit_service_1 = require("./scenarios-planning-unit.service");
let ScenariosPlanningUnitModule = class ScenariosPlanningUnitModule {
};
ScenariosPlanningUnitModule = __decorate([
    common_1.Module({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([scenarios_planning_unit_geo_entity_1.ScenariosPlanningUnitGeoEntity], remote_connection_name_1.remoteConnectionName),
        ],
        providers: [scenarios_planning_unit_service_1.ScenariosPlanningUnitService],
        exports: [scenarios_planning_unit_service_1.ScenariosPlanningUnitService, typeorm_1.TypeOrmModule],
    })
], ScenariosPlanningUnitModule);
exports.ScenariosPlanningUnitModule = ScenariosPlanningUnitModule;
//# sourceMappingURL=scenarios-planning-unit.module.js.map