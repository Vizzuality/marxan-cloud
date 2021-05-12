"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArePuidsAllowedAdapter = void 0;
const common_1 = require("@nestjs/common");
const lodash_1 = require("lodash");
const scenarios_planning_unit_service_1 = require("../../../../scenarios-planning-unit/scenarios-planning-unit.service");
const is_defined_1 = require("../../../../../utils/is-defined");
let ArePuidsAllowedAdapter = class ArePuidsAllowedAdapter extends scenarios_planning_unit_service_1.ScenariosPlanningUnitService {
    async validate(scenarioId, puIds) {
        const allowedFeaturesIds = (await this.findAll(undefined, {
            params: {
                scenarioId,
            },
        }))[0]
            .map((scenario) => scenario.puGeometryId)
            .filter(is_defined_1.isDefined);
        const diff = lodash_1.differenceWith(puIds, allowedFeaturesIds);
        return {
            errors: diff.map((missingId) => `Missing ${missingId}`),
        };
    }
};
ArePuidsAllowedAdapter = __decorate([
    common_1.Injectable()
], ArePuidsAllowedAdapter);
exports.ArePuidsAllowedAdapter = ArePuidsAllowedAdapter;
//# sourceMappingURL=are-puids-allowed-adapter.js.map