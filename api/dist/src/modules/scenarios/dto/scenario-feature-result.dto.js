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
exports.ScenarioFeatureResultDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const scenarios_features_1 = require("../../scenarios-features");
class ScenarioFeatureDataDto {
    constructor() {
        this.type = 'features';
    }
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], ScenarioFeatureDataDto.prototype, "type", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], ScenarioFeatureDataDto.prototype, "id", void 0);
__decorate([
    swagger_1.ApiProperty({
        isArray: true,
        type: () => scenarios_features_1.ScenariosFeaturesView,
    }),
    __metadata("design:type", Array)
], ScenarioFeatureDataDto.prototype, "attributes", void 0);
class ScenarioFeatureResultDto {
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", ScenarioFeatureDataDto)
], ScenarioFeatureResultDto.prototype, "data", void 0);
exports.ScenarioFeatureResultDto = ScenarioFeatureResultDto;
//# sourceMappingURL=scenario-feature-result.dto.js.map