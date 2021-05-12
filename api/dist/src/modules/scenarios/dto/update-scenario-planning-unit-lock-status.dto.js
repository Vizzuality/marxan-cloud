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
exports.UpdateScenarioPlanningUnitLockStatusDto = exports.PlanningUnitsByGeoJsonUpdateDto = exports.PlanningUnitsByIdUpdateDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const is_feature_collection_of_polygons_1 = require("./is-feature-collection-of-polygons");
class PlanningUnitsByIdUpdateDto {
}
__decorate([
    swagger_1.ApiPropertyOptional(),
    class_validator_1.IsOptional(),
    class_validator_1.IsUUID('all', { each: true }),
    __metadata("design:type", Array)
], PlanningUnitsByIdUpdateDto.prototype, "include", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    class_validator_1.IsOptional(),
    class_validator_1.IsUUID('all', { each: true }),
    __metadata("design:type", Array)
], PlanningUnitsByIdUpdateDto.prototype, "exclude", void 0);
exports.PlanningUnitsByIdUpdateDto = PlanningUnitsByIdUpdateDto;
class PlanningUnitsByGeoJsonUpdateDto {
}
__decorate([
    swagger_1.ApiPropertyOptional(),
    class_validator_1.IsOptional(),
    is_feature_collection_of_polygons_1.IsFeatureCollectionOfPolygons({ each: true }),
    __metadata("design:type", Array)
], PlanningUnitsByGeoJsonUpdateDto.prototype, "include", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    class_validator_1.IsOptional(),
    is_feature_collection_of_polygons_1.IsFeatureCollectionOfPolygons({ each: true }),
    __metadata("design:type", Array)
], PlanningUnitsByGeoJsonUpdateDto.prototype, "exclude", void 0);
exports.PlanningUnitsByGeoJsonUpdateDto = PlanningUnitsByGeoJsonUpdateDto;
class UpdateScenarioPlanningUnitLockStatusDto {
}
__decorate([
    swagger_1.ApiPropertyOptional(),
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => PlanningUnitsByIdUpdateDto),
    __metadata("design:type", PlanningUnitsByIdUpdateDto)
], UpdateScenarioPlanningUnitLockStatusDto.prototype, "byId", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    class_validator_1.ValidateNested(),
    class_transformer_1.Type(() => PlanningUnitsByGeoJsonUpdateDto),
    __metadata("design:type", PlanningUnitsByGeoJsonUpdateDto)
], UpdateScenarioPlanningUnitLockStatusDto.prototype, "byGeoJson", void 0);
exports.UpdateScenarioPlanningUnitLockStatusDto = UpdateScenarioPlanningUnitLockStatusDto;
//# sourceMappingURL=update-scenario-planning-unit-lock-status.dto.js.map