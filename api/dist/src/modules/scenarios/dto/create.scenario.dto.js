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
exports.CreateScenarioDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const protected_area_geo_entity_1 = require("../../protected-areas/protected-area.geo.entity");
const scenario_api_entity_1 = require("../scenario.api.entity");
class CreateScenarioDTO {
}
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CreateScenarioDTO.prototype, "name", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateScenarioDTO.prototype, "description", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsEnum(Object.values(scenario_api_entity_1.ScenarioType)),
    __metadata("design:type", String)
], CreateScenarioDTO.prototype, "type", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsUUID(),
    __metadata("design:type", String)
], CreateScenarioDTO.prototype, "projectId", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    class_validator_1.IsOptional(),
    class_validator_1.IsArray(),
    class_validator_1.IsEnum(protected_area_geo_entity_1.IUCNCategory, { each: true }),
    __metadata("design:type", Array)
], CreateScenarioDTO.prototype, "wdpaIucnCategories", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    class_validator_1.IsOptional(),
    class_validator_1.IsUUID(4, { each: true }),
    __metadata("design:type", Array)
], CreateScenarioDTO.prototype, "customProtectedAreaIds", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    class_validator_1.IsInt(),
    class_validator_1.IsOptional(),
    class_validator_1.Min(0),
    class_validator_1.Max(100),
    __metadata("design:type", Number)
], CreateScenarioDTO.prototype, "wdpaThreshold", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    class_validator_1.IsOptional(),
    class_validator_1.IsInt(),
    class_validator_1.Min(0),
    __metadata("design:type", Number)
], CreateScenarioDTO.prototype, "numberOfRuns", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    class_validator_1.IsNumber(),
    class_validator_1.IsOptional(),
    __metadata("design:type", Number)
], CreateScenarioDTO.prototype, "boundaryLengthModifier", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    class_validator_1.IsOptional(),
    __metadata("design:type", Object)
], CreateScenarioDTO.prototype, "metadata", void 0);
__decorate([
    swagger_1.ApiProperty({ enum: scenario_api_entity_1.JobStatus, enumName: 'JobStatus' }),
    class_validator_1.IsOptional(),
    class_validator_1.IsEnum(Object.values(scenario_api_entity_1.JobStatus)),
    __metadata("design:type", String)
], CreateScenarioDTO.prototype, "status", void 0);
exports.CreateScenarioDTO = CreateScenarioDTO;
//# sourceMappingURL=create.scenario.dto.js.map