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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoFeaturesController = void 0;
const common_1 = require("@nestjs/common");
const geo_feature_geo_entity_1 = require("./geo-feature.geo.entity");
const geo_features_service_1 = require("./geo-features.service");
const swagger_1 = require("@nestjs/swagger");
const api_config_1 = require("../../api.config");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
const json_api_parameters_decorator_1 = require("../../decorators/json-api-parameters.decorator");
const nestjs_base_service_1 = require("nestjs-base-service");
let GeoFeaturesController = class GeoFeaturesController {
    constructor(service) {
        this.service = service;
    }
    async findAll(fetchSpecification) {
        const results = await this.service.findAllPaginated(fetchSpecification);
        return this.service.serialize(results.data, results.metadata);
    }
    async findOne(id) {
        return await this.service.serialize(await this.service.fakeFindOne(id));
    }
};
__decorate([
    swagger_1.ApiOperation({
        description: 'Find all geo features',
    }),
    swagger_1.ApiOkResponse({
        type: geo_feature_geo_entity_1.GeoFeatureResult,
    }),
    swagger_1.ApiUnauthorizedResponse(),
    swagger_1.ApiForbiddenResponse(),
    json_api_parameters_decorator_1.JSONAPIQueryParams(),
    common_1.Get(),
    __param(0, nestjs_base_service_1.ProcessFetchSpecification()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GeoFeaturesController.prototype, "findAll", null);
__decorate([
    swagger_1.ApiOperation({ description: 'Find geo feature by id' }),
    swagger_1.ApiOkResponse({ type: geo_feature_geo_entity_1.GeoFeatureResult }),
    json_api_parameters_decorator_1.JSONAPISingleEntityQueryParams(),
    common_1.Get(':id'),
    __param(0, common_1.Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GeoFeaturesController.prototype, "findOne", null);
GeoFeaturesController = __decorate([
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiTags(geo_feature_geo_entity_1.geoFeatureResource.className),
    common_1.Controller(`${api_config_1.apiGlobalPrefixes.v1}/${geo_feature_geo_entity_1.geoFeatureResource.moduleControllerPrefix}`),
    __metadata("design:paramtypes", [geo_features_service_1.GeoFeaturesService])
], GeoFeaturesController);
exports.GeoFeaturesController = GeoFeaturesController;
//# sourceMappingURL=geo-features.controller.js.map