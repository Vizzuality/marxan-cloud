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
exports.UpdatePlanningUnitsService = void 0;
const common_1 = require("@nestjs/common");
const are_puids_allowed_port_1 = require("./are-puids-allowed.port");
const request_job_port_1 = require("./request-job.port");
let UpdatePlanningUnitsService = class UpdatePlanningUnitsService {
    constructor(puUuidValidator, jobRequester) {
        this.puUuidValidator = puUuidValidator;
        this.jobRequester = jobRequester;
    }
    async update(scenarioId, constraints) {
        var _a, _b, _c, _d;
        const targetPuIds = [
            ...((_b = (_a = constraints.include) === null || _a === void 0 ? void 0 : _a.pu) !== null && _b !== void 0 ? _b : []),
            ...((_d = (_c = constraints.exclude) === null || _c === void 0 ? void 0 : _c.pu) !== null && _d !== void 0 ? _d : []),
        ];
        if (targetPuIds.length > 0) {
            const { errors } = await this.puUuidValidator.validate(scenarioId, targetPuIds);
            if (errors.length > 0) {
                throw new Error('One or more of the planning units provided for exclusion or inclusion does not match any planning unit of the present scenario.');
            }
        }
        await this.jobRequester.queue(Object.assign({ scenarioId }, constraints));
        return true;
    }
};
UpdatePlanningUnitsService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [are_puids_allowed_port_1.ArePuidsAllowedPort,
        request_job_port_1.RequestJobPort])
], UpdatePlanningUnitsService);
exports.UpdatePlanningUnitsService = UpdatePlanningUnitsService;
//# sourceMappingURL=update-planning-units.service.js.map