"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScenariosPlanningUnitService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const app_base_service_1 = require("../../utils/app-base.service");
const config_utils_1 = require("../../utils/config.utils");
const remote_connection_name_1 = require("./entities/remote-connection-name");
const scenarios_planning_unit_geo_entity_1 = require("./entities/scenarios-planning-unit.geo.entity");
let ScenariosPlanningUnitService = class ScenariosPlanningUnitService extends app_base_service_1.AppBaseService {
    constructor(puData) {
        super(puData, 'scenario_planning_unit', 'scenario_planning_units', {
            logging: { muteAll: config_utils_1.AppConfig.get('logging.muteAll', false) },
        });
        this.puData = puData;
    }
    setFilters(query, filters, info) {
        var _a;
        const scenarioId = (_a = info === null || info === void 0 ? void 0 : info.params) === null || _a === void 0 ? void 0 : _a.scenarioId;
        if (scenarioId) {
            return query.andWhere(`${this.alias}.scenario_id = :scenarioId`, {
                scenarioId,
            });
        }
        return query;
    }
    get serializerConfig() {
        return {
            attributes: ['id', 'lockStatus', 'puGeometryId', 'scenarioId'],
            keyForAttribute: 'camelCase',
        };
    }
};
ScenariosPlanningUnitService = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(scenarios_planning_unit_geo_entity_1.ScenariosPlanningUnitGeoEntity, remote_connection_name_1.remoteConnectionName)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ScenariosPlanningUnitService);
exports.ScenariosPlanningUnitService = ScenariosPlanningUnitService;
//# sourceMappingURL=scenarios-planning-unit.service.js.map