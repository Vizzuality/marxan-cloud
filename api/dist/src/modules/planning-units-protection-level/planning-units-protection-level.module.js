"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanningUnitsProtectionLevelModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const calculate_planning_units_protection_level_handler_1 = require("./calculate-planning-units-protection-level.handler");
const queue_module_1 = require("../queue/queue.module");
const queue_name_1 = require("./queue.name");
let PlanningUnitsProtectionLevelModule = class PlanningUnitsProtectionLevelModule {
};
PlanningUnitsProtectionLevelModule = __decorate([
    common_1.Module({
        imports: [
            cqrs_1.CqrsModule,
            queue_module_1.QueueModule.register({
                name: queue_name_1.queueName,
            }),
        ],
        providers: [calculate_planning_units_protection_level_handler_1.CalculatePlanningUnitsProtectionLevelHandler],
    })
], PlanningUnitsProtectionLevelModule);
exports.PlanningUnitsProtectionLevelModule = PlanningUnitsProtectionLevelModule;
//# sourceMappingURL=planning-units-protection-level.module.js.map