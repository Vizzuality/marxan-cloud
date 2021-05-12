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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculatePlanningUnitsProtectionLevelHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const calculate_planning_units_protection_level_command_1 = require("./calculate-planning-units-protection-level.command");
const queue_service_1 = require("../queue/queue.service");
let CalculatePlanningUnitsProtectionLevelHandler = class CalculatePlanningUnitsProtectionLevelHandler {
    constructor(queueService) {
        this.queueService = queueService;
        this.queueService.registerEventHandler('completed', this.onCompleted);
    }
    async execute(command) {
        await this.queueService.queue.add(`calculate-planning-units-protection-level-${command.scenarioId}`, command, {});
        return true;
    }
    onCompleted({ jobId }) {
        console.log(`--- job ${jobId} completed`);
    }
};
CalculatePlanningUnitsProtectionLevelHandler = __decorate([
    cqrs_1.CommandHandler(calculate_planning_units_protection_level_command_1.CalculatePlanningUnitsProtectionLevel),
    __metadata("design:paramtypes", [queue_service_1.QueueService])
], CalculatePlanningUnitsProtectionLevelHandler);
exports.CalculatePlanningUnitsProtectionLevelHandler = CalculatePlanningUnitsProtectionLevelHandler;
//# sourceMappingURL=calculate-planning-units-protection-level.handler.js.map