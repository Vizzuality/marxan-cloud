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
exports.CreateProjectDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const project_api_entity_1 = require("../project.api.entity");
class CreateProjectDTO {
}
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CreateProjectDTO.prototype, "name", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    class_validator_1.IsOptional(),
    class_validator_1.IsString(),
    __metadata("design:type", String)
], CreateProjectDTO.prototype, "description", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsUUID(),
    __metadata("design:type", String)
], CreateProjectDTO.prototype, "organizationId", void 0);
__decorate([
    swagger_1.ApiPropertyOptional({
        description: 'ISO 3166-1 alpha3 country code (uppercase)',
        example: 'ESP',
    }),
    class_validator_1.IsAlpha(),
    class_validator_1.IsUppercase(),
    class_validator_1.Length(3, 3),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateProjectDTO.prototype, "countryId", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateProjectDTO.prototype, "adminAreaLevel1Id", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    class_validator_1.IsString(),
    class_validator_1.IsOptional(),
    __metadata("design:type", String)
], CreateProjectDTO.prototype, "adminAreaLevel2Id", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    class_validator_1.IsOptional(),
    class_validator_1.IsEnum(Object.values(project_api_entity_1.PlanningUnitGridShape)),
    __metadata("design:type", String)
], CreateProjectDTO.prototype, "planningUnitGridShape", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    class_validator_1.IsOptional(),
    class_validator_1.IsNumber(),
    __metadata("design:type", Number)
], CreateProjectDTO.prototype, "planningUnitAreakm2", void 0);
__decorate([
    swagger_1.ApiPropertyOptional({
        description: `Geometry part of GeoJson; MultiPolygon or Polygon`,
    }),
    class_validator_1.IsOptional(),
    class_validator_1.IsObject(),
    __metadata("design:type", Object)
], CreateProjectDTO.prototype, "extent", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    class_validator_1.IsOptional(),
    class_validator_1.IsObject(),
    __metadata("design:type", Object)
], CreateProjectDTO.prototype, "metadata", void 0);
exports.CreateProjectDTO = CreateProjectDTO;
//# sourceMappingURL=create.project.dto.js.map