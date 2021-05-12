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
exports.RemoteScenarioFeaturesData = exports.remoteScenarioFeaturesDataName = void 0;
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const geo_feature_api_entity_1 = require("../../geo-features/geo-feature.api.entity");
exports.remoteScenarioFeaturesDataName = 'scenario_features_data';
let RemoteScenarioFeaturesData = class RemoteScenarioFeaturesData {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], RemoteScenarioFeaturesData.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ name: 'feature_class_id' }),
    __metadata("design:type", String)
], RemoteScenarioFeaturesData.prototype, "featuresDataId", void 0);
__decorate([
    typeorm_1.Column({ name: 'scenario_id' }),
    __metadata("design:type", String)
], RemoteScenarioFeaturesData.prototype, "scenarioId", void 0);
__decorate([
    typeorm_1.Column({ name: 'total_area' }),
    __metadata("design:type", Number)
], RemoteScenarioFeaturesData.prototype, "totalArea", void 0);
__decorate([
    typeorm_1.Column({ name: 'current_pa' }),
    __metadata("design:type", Number)
], RemoteScenarioFeaturesData.prototype, "currentArea", void 0);
__decorate([
    swagger_1.ApiProperty({
        description: `Feature Penalty Factor for this feature run.`,
    }),
    typeorm_1.Column(),
    __metadata("design:type", Number)
], RemoteScenarioFeaturesData.prototype, "fpf", void 0);
__decorate([
    swagger_1.ApiProperty({
        description: `Total area space, expressed in m^2`,
    }),
    typeorm_1.Column(),
    __metadata("design:type", Number)
], RemoteScenarioFeaturesData.prototype, "target", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], RemoteScenarioFeaturesData.prototype, "target2", void 0);
__decorate([
    swagger_1.ApiProperty({
        description: `0-100 (%) value of target protection coverage of all available species.`,
    }),
    __metadata("design:type", Number)
], RemoteScenarioFeaturesData.prototype, "coverageTarget", void 0);
__decorate([
    swagger_1.ApiProperty({
        description: `Equivalent of \`target\` percentage in covered area, expressed in m^2`,
    }),
    __metadata("design:type", Number)
], RemoteScenarioFeaturesData.prototype, "coverageTargetArea", void 0);
__decorate([
    swagger_1.ApiProperty({
        description: `0-100 (%) value of how many species % is protected currently.`,
    }),
    __metadata("design:type", Number)
], RemoteScenarioFeaturesData.prototype, "met", void 0);
__decorate([
    swagger_1.ApiProperty({
        description: `Equivalent of \`met\` percentage in covered area, expressed in m^2`,
    }),
    __metadata("design:type", Number)
], RemoteScenarioFeaturesData.prototype, "metArea", void 0);
__decorate([
    swagger_1.ApiProperty({
        description: `Shorthand value if current \`met\` is good enough compared to \`target\`.`,
    }),
    __metadata("design:type", Boolean)
], RemoteScenarioFeaturesData.prototype, "onTarget", void 0);
__decorate([
    swagger_1.ApiProperty({
        enum: geo_feature_api_entity_1.FeatureTags,
    }),
    __metadata("design:type", String)
], RemoteScenarioFeaturesData.prototype, "tag", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], RemoteScenarioFeaturesData.prototype, "featureId", void 0);
__decorate([
    swagger_1.ApiPropertyOptional({
        description: `Name of the feature, for example \`Lion in Deserts\`.`,
    }),
    __metadata("design:type", Object)
], RemoteScenarioFeaturesData.prototype, "name", void 0);
__decorate([
    swagger_1.ApiPropertyOptional({
        description: `Description of the feature.`,
    }),
    __metadata("design:type", Object)
], RemoteScenarioFeaturesData.prototype, "description", void 0);
RemoteScenarioFeaturesData = __decorate([
    typeorm_1.Entity(exports.remoteScenarioFeaturesDataName)
], RemoteScenarioFeaturesData);
exports.RemoteScenarioFeaturesData = RemoteScenarioFeaturesData;
//# sourceMappingURL=remote-scenario-features-data.geo.entity.js.map