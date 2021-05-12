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
exports.ScenariosFeaturesView = void 0;
const swagger_1 = require("@nestjs/swagger");
class ScenariosFeaturesView {
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], ScenariosFeaturesView.prototype, "featureId", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    __metadata("design:type", Object)
], ScenariosFeaturesView.prototype, "tag", void 0);
__decorate([
    swagger_1.ApiPropertyOptional({
        description: `Name of the feature, for example \`Lion in Deserts\`.`,
    }),
    __metadata("design:type", Object)
], ScenariosFeaturesView.prototype, "name", void 0);
__decorate([
    swagger_1.ApiPropertyOptional({
        description: `Description of the feature.`,
    }),
    __metadata("design:type", Object)
], ScenariosFeaturesView.prototype, "description", void 0);
__decorate([
    swagger_1.ApiProperty({
        description: `0-100 (%) value of target protection coverage of all available species.`,
    }),
    __metadata("design:type", Number)
], ScenariosFeaturesView.prototype, "target", void 0);
__decorate([
    swagger_1.ApiProperty({
        description: `Equivalent of \`target\` percentage in covered area, expressed in m^2`,
    }),
    __metadata("design:type", Number)
], ScenariosFeaturesView.prototype, "targetArea", void 0);
__decorate([
    swagger_1.ApiProperty({
        description: `Total area space, expressed in m^2`,
    }),
    __metadata("design:type", Number)
], ScenariosFeaturesView.prototype, "totalArea", void 0);
__decorate([
    swagger_1.ApiProperty({
        description: `0-100 (%) value of how many species % is protected currently.`,
    }),
    __metadata("design:type", Number)
], ScenariosFeaturesView.prototype, "met", void 0);
__decorate([
    swagger_1.ApiProperty({
        description: `Equivalent of \`met\` percentage in covered area, expressed in m^2`,
    }),
    __metadata("design:type", Number)
], ScenariosFeaturesView.prototype, "metArea", void 0);
__decorate([
    swagger_1.ApiProperty({
        description: `Shorthand value if current \`met\` is good enough compared to \`target\`.`,
    }),
    __metadata("design:type", Boolean)
], ScenariosFeaturesView.prototype, "onTarget", void 0);
__decorate([
    swagger_1.ApiProperty({
        description: `Feature Penalty Factor for this feature run.`,
    }),
    __metadata("design:type", Number)
], ScenariosFeaturesView.prototype, "fpf", void 0);
exports.ScenariosFeaturesView = ScenariosFeaturesView;
//# sourceMappingURL=scenario-features.dto.js.map