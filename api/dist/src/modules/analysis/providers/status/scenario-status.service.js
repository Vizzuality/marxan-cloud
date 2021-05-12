"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScenarioStatusService = void 0;
const common_1 = require("@nestjs/common");
const scenario_api_entity_1 = require("../../../scenarios/scenario.api.entity");
let ScenarioStatusService = class ScenarioStatusService {
    async status(scenarioId) {
        return {
            id: scenarioId,
            status: scenario_api_entity_1.JobStatus.done,
        };
    }
};
ScenarioStatusService = __decorate([
    common_1.Injectable()
], ScenarioStatusService);
exports.ScenarioStatusService = ScenarioStatusService;
//# sourceMappingURL=scenario-status.service.js.map