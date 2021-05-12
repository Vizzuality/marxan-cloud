"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoFeaturesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const project_api_entity_1 = require("../projects/project.api.entity");
const geo_feature_api_entity_1 = require("./geo-feature.api.entity");
const geo_feature_geo_entity_1 = require("./geo-feature.geo.entity");
const geo_features_controller_1 = require("./geo-features.controller");
const geo_features_service_1 = require("./geo-features.service");
const ormconfig_1 = require("../../ormconfig");
let GeoFeaturesModule = class GeoFeaturesModule {
};
GeoFeaturesModule = __decorate([
    common_1.Module({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([geo_feature_geo_entity_1.GeoFeatureGeometry, geo_feature_geo_entity_1.GeoFeaturePropertySet], ormconfig_1.apiConnections.geoprocessingDB.name),
            typeorm_1.TypeOrmModule.forFeature([geo_feature_api_entity_1.GeoFeature, project_api_entity_1.Project]),
        ],
        providers: [geo_features_service_1.GeoFeaturesService],
        controllers: [geo_features_controller_1.GeoFeaturesController],
        exports: [geo_features_service_1.GeoFeaturesService],
    })
], GeoFeaturesModule);
exports.GeoFeaturesModule = GeoFeaturesModule;
//# sourceMappingURL=geo-features.module.js.map