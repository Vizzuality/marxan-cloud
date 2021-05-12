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
exports.AdminAreasController = void 0;
const common_1 = require("@nestjs/common");
const admin_area_geo_entity_1 = require("./admin-area.geo.entity");
const admin_areas_service_1 = require("./admin-areas.service");
const swagger_1 = require("@nestjs/swagger");
const api_config_1 = require("../../api.config");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
const json_api_parameters_decorator_1 = require("../../decorators/json-api-parameters.decorator");
const nestjs_base_service_1 = require("nestjs-base-service");
let AdminAreasController = class AdminAreasController {
    constructor(service) {
        this.service = service;
    }
    async findAllAdminAreasInGivenCountry(fetchSpecification, countryId, { level }) {
        const results = await this.service.findAllPaginated(Object.assign(Object.assign({}, fetchSpecification), { filter: Object.assign(Object.assign({}, fetchSpecification.filter), { countryId, level }) }));
        return this.service.serialize(results.data, results.metadata);
    }
    async findAllChildrenAdminAreas(fetchSpecification, areaId) {
        const results = await this.service.getChildrenAdminAreas(areaId, fetchSpecification);
        return await this.service.serialize(results.data, results.metadata);
    }
    async findOne(fetchSpecification, areaId) {
        return await this.service.serialize(await this.service.getByLevel1OrLevel2Id(areaId, fetchSpecification));
    }
};
__decorate([
    swagger_1.ApiOperation({
        description: 'Find administrative areas within a given country.',
    }),
    swagger_1.ApiOkResponse({
        type: admin_area_geo_entity_1.AdminAreaResult,
    }),
    swagger_1.ApiUnauthorizedResponse(),
    swagger_1.ApiForbiddenResponse(),
    json_api_parameters_decorator_1.JSONAPIQueryParams(),
    swagger_1.ApiParam({
        name: 'countryId',
        description: 'Parent country of administrative areas',
        type: String,
        required: true,
    }),
    swagger_1.ApiQuery({
        name: 'level',
        description: 'Whether to filter for areas of a specific level (1 or 2). By default areas of both level 1 and level 2 areas may be included in the response, if present in the search results.',
        type: Number,
        required: false,
        example: '2',
    }),
    common_1.Get('/countries/:countryId/administrative-areas'),
    __param(0, nestjs_base_service_1.ProcessFetchSpecification()),
    __param(1, common_1.Param('countryId')),
    __param(2, common_1.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_areas_service_1.AdminAreaLevel]),
    __metadata("design:returntype", Promise)
], AdminAreasController.prototype, "findAllAdminAreasInGivenCountry", null);
__decorate([
    swagger_1.ApiOperation({
        description: 'Find administrative areas that are children of a given one.',
    }),
    swagger_1.ApiOkResponse({ type: admin_area_geo_entity_1.AdminAreaResult }),
    json_api_parameters_decorator_1.JSONAPIQueryParams(),
    swagger_1.ApiParam({
        name: 'areaId',
        description: 'Parent admin area (gid)',
        type: String,
        required: true,
    }),
    common_1.Get('/administrative-areas/:areaId/subdivisions'),
    __param(0, nestjs_base_service_1.ProcessFetchSpecification()),
    __param(1, common_1.Param('areaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminAreasController.prototype, "findAllChildrenAdminAreas", null);
__decorate([
    swagger_1.ApiOperation({ description: 'Find administrative area by id' }),
    swagger_1.ApiOkResponse({ type: admin_area_geo_entity_1.AdminAreaResult }),
    json_api_parameters_decorator_1.JSONAPIQueryParams(),
    common_1.Get('/administrative-areas/:areaId'),
    __param(0, nestjs_base_service_1.ProcessFetchSpecification()),
    __param(1, common_1.Param('areaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminAreasController.prototype, "findOne", null);
AdminAreasController = __decorate([
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiTags(admin_area_geo_entity_1.adminAreaResource.className),
    common_1.Controller(`${api_config_1.apiGlobalPrefixes.v1}`),
    __metadata("design:paramtypes", [admin_areas_service_1.AdminAreasService])
], AdminAreasController);
exports.AdminAreasController = AdminAreasController;
//# sourceMappingURL=admin-areas.controller.js.map