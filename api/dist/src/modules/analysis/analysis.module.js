"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisModule = void 0;
const common_1 = require("@nestjs/common");
const planning_units_module_1 = require("../planning-units/planning-units.module");
const scenarios_planning_unit_module_1 = require("../scenarios-planning-unit/scenarios-planning-unit.module");
const adjust_cost_surface_1 = require("./entry-points/adjust-cost-surface");
const adjust_planning_units_1 = require("./entry-points/adjust-planning-units");
const get_scenario_status_1 = require("./entry-points/get-scenario-status");
const update_cost_surface_service_1 = require("./providers/cost-surface/update-cost-surface.service");
const are_puids_allowed_adapter_1 = require("./providers/planning-units/adapters/are-puids-allowed-adapter");
const are_puids_allowed_port_1 = require("./providers/planning-units/are-puids-allowed.port");
const update_planning_units_service_1 = require("./providers/planning-units/update-planning-units.service");
const scenario_status_service_1 = require("./providers/status/scenario-status.service");
const request_job_port_1 = require("./providers/planning-units/request-job.port");
const async_jobs_adapter_1 = require("./providers/planning-units/adapters/async-jobs-adapter");
let AnalysisModule = class AnalysisModule {
};
AnalysisModule = __decorate([
    common_1.Module({
        imports: [scenarios_planning_unit_module_1.ScenariosPlanningUnitModule, planning_units_module_1.PlanningUnitsModule],
        providers: [
            {
                provide: adjust_cost_surface_1.AdjustCostSurface,
                useClass: update_cost_surface_service_1.UpdateCostSurfaceService,
            },
            {
                provide: adjust_planning_units_1.AdjustPlanningUnits,
                useClass: update_planning_units_service_1.UpdatePlanningUnitsService,
            },
            {
                provide: get_scenario_status_1.GetScenarioStatus,
                useClass: scenario_status_service_1.ScenarioStatusService,
            },
            update_planning_units_service_1.UpdatePlanningUnitsService,
            update_cost_surface_service_1.UpdateCostSurfaceService,
            {
                provide: are_puids_allowed_port_1.ArePuidsAllowedPort,
                useClass: are_puids_allowed_adapter_1.ArePuidsAllowedAdapter,
            },
            {
                provide: request_job_port_1.RequestJobPort,
                useClass: async_jobs_adapter_1.AsyncJobsAdapter,
            },
        ],
        exports: [adjust_cost_surface_1.AdjustCostSurface, adjust_planning_units_1.AdjustPlanningUnits, get_scenario_status_1.GetScenarioStatus],
    })
], AnalysisModule);
exports.AnalysisModule = AnalysisModule;
//# sourceMappingURL=analysis.module.js.map