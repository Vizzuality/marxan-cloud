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
exports.GeoFeatureResult = exports.JSONAPIGeoFeaturesData = exports.GeoFeature = exports.FeatureTags = exports.geoFeatureResource = void 0;
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const resource_interface_1 = require("../../types/resource.interface");
exports.geoFeatureResource = {
    className: 'GeoFeature',
    name: {
        singular: 'geo_feature',
        plural: 'geo_features',
    },
    moduleControllerPrefix: 'geo-features',
};
var FeatureTags;
(function (FeatureTags) {
    FeatureTags["bioregional"] = "bioregional";
    FeatureTags["species"] = "species";
})(FeatureTags = exports.FeatureTags || (exports.FeatureTags = {}));
let GeoFeature = class GeoFeature {
};
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", String)
], GeoFeature.prototype, "id", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('varchar', { name: 'feature_class_name' }),
    __metadata("design:type", String)
], GeoFeature.prototype, "featureClassName", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('varchar'),
    __metadata("design:type", Object)
], GeoFeature.prototype, "description", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    __metadata("design:type", String)
], GeoFeature.prototype, "source", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('varchar'),
    __metadata("design:type", Object)
], GeoFeature.prototype, "alias", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('varchar', { name: 'property_name' }),
    __metadata("design:type", String)
], GeoFeature.prototype, "propertyName", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('uuid'),
    __metadata("design:type", Array)
], GeoFeature.prototype, "intersection", void 0);
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.Column('varchar'),
    __metadata("design:type", String)
], GeoFeature.prototype, "tag", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    __metadata("design:type", Array)
], GeoFeature.prototype, "properties", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('uuid', { name: 'project_id' }),
    __metadata("design:type", String)
], GeoFeature.prototype, "projectId", void 0);
GeoFeature = __decorate([
    typeorm_1.Entity('features')
], GeoFeature);
exports.GeoFeature = GeoFeature;
class JSONAPIGeoFeaturesData {
    constructor() {
        this.type = exports.geoFeatureResource.name.plural;
    }
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Object)
], JSONAPIGeoFeaturesData.prototype, "type", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], JSONAPIGeoFeaturesData.prototype, "id", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", GeoFeature)
], JSONAPIGeoFeaturesData.prototype, "attributes", void 0);
exports.JSONAPIGeoFeaturesData = JSONAPIGeoFeaturesData;
class GeoFeatureResult {
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", JSONAPIGeoFeaturesData)
], GeoFeatureResult.prototype, "data", void 0);
exports.GeoFeatureResult = GeoFeatureResult;
//# sourceMappingURL=geo-feature.api.entity.js.map