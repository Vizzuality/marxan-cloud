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
exports.GeoFeaturePropertySet = exports.GeoFeatureResult = exports.JSONAPIGeoFeaturesGeometryData = exports.GeoFeatureGeometry = exports.geoFeatureResource = void 0;
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
let GeoFeatureGeometry = class GeoFeatureGeometry {
};
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", String)
], GeoFeatureGeometry.prototype, "id", void 0);
GeoFeatureGeometry = __decorate([
    typeorm_1.Entity('features_data')
], GeoFeatureGeometry);
exports.GeoFeatureGeometry = GeoFeatureGeometry;
class JSONAPIGeoFeaturesGeometryData {
    constructor() {
        this.type = exports.geoFeatureResource.name.plural;
    }
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Object)
], JSONAPIGeoFeaturesGeometryData.prototype, "type", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], JSONAPIGeoFeaturesGeometryData.prototype, "id", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", GeoFeatureGeometry)
], JSONAPIGeoFeaturesGeometryData.prototype, "attributes", void 0);
exports.JSONAPIGeoFeaturesGeometryData = JSONAPIGeoFeaturesGeometryData;
class GeoFeatureResult {
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", JSONAPIGeoFeaturesGeometryData)
], GeoFeatureResult.prototype, "data", void 0);
exports.GeoFeatureResult = GeoFeatureResult;
let GeoFeaturePropertySet = class GeoFeaturePropertySet {
};
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.PrimaryColumn('uuid', { name: 'feature_id' }),
    __metadata("design:type", String)
], GeoFeaturePropertySet.prototype, "featureId", void 0);
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.Column('jsonb', { name: 'properties_for_feature' }),
    __metadata("design:type", Object)
], GeoFeaturePropertySet.prototype, "properties", void 0);
GeoFeaturePropertySet = __decorate([
    typeorm_1.Entity('feature_properties')
], GeoFeaturePropertySet);
exports.GeoFeaturePropertySet = GeoFeaturePropertySet;
//# sourceMappingURL=geo-feature.geo.entity.js.map