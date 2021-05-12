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
exports.ProtectedAreasController = void 0;
const common_1 = require("@nestjs/common");
const protected_area_geo_entity_1 = require("./protected-area.geo.entity");
const swagger_1 = require("@nestjs/swagger");
const api_config_1 = require("../../api.config");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
const json_api_parameters_decorator_1 = require("../../decorators/json-api-parameters.decorator");
const nestjs_base_service_1 = require("nestjs-base-service");
const protected_areas_service_1 = require("./protected-areas.service");
const iucn_protected_area_category_dto_1 = require("./dto/iucn-protected-area-category.dto");
let ProtectedAreasController = class ProtectedAreasController {
    constructor(service) {
        this.service = service;
    }
    async findAll(fetchSpecification) {
        const results = await this.service.findAllPaginated(fetchSpecification, {});
        return this.service.serialize(results.data, results.metadata);
    }
    async listIUCNProtectedAreaCategories(fetchSpecification) {
        var _a;
        const adminAreaId = Array.isArray((_a = fetchSpecification === null || fetchSpecification === void 0 ? void 0 : fetchSpecification.filter) === null || _a === void 0 ? void 0 : _a.adminAreaId)
            ? fetchSpecification.filter.adminAreaId[0]
            : undefined;
        return await this.service.findAllProtectedAreaCategories(Object.assign(Object.assign({}, fetchSpecification), { filter: Object.assign(Object.assign({}, fetchSpecification.filter), { adminAreaId }) }));
    }
    async findOne(id, fetchSpecification) {
        return await this.service.serialize(await this.service.getById(id, fetchSpecification));
    }
};
__decorate([
    swagger_1.ApiOperation({
        description: 'Find all protected areas',
    }),
    swagger_1.ApiOkResponse({
        type: protected_area_geo_entity_1.ProtectedAreaResult,
    }),
    json_api_parameters_decorator_1.JSONAPIQueryParams({
        entitiesAllowedAsIncludes: protected_areas_service_1.protectedAreaResource.entitiesAllowedAsIncludes,
        availableFilters: [
            { name: 'fullName' },
            { name: 'wdpaId' },
            { name: 'iucnCategory' },
            { name: 'status' },
            { name: 'designation' },
            { name: 'countryId' },
        ],
    }),
    common_1.Get(),
    __param(0, nestjs_base_service_1.ProcessFetchSpecification()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProtectedAreasController.prototype, "findAll", null);
__decorate([
    swagger_1.ApiOperation({
        description: 'Find unique IUCN categories among protected areas in a single given administrative area.',
    }),
    swagger_1.ApiQuery({
        name: 'filter[adminAreaId]',
        description: 'Only protected areas within the given admin area will be considered.',
        type: String,
        required: true,
    }),
    swagger_1.ApiOkResponse({
        type: iucn_protected_area_category_dto_1.IUCNProtectedAreaCategoryResult,
    }),
    swagger_1.ApiUnauthorizedResponse(),
    swagger_1.ApiForbiddenResponse(),
    json_api_parameters_decorator_1.JSONAPIQueryParams(),
    common_1.Get('iucn-categories'),
    __param(0, nestjs_base_service_1.ProcessFetchSpecification()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProtectedAreasController.prototype, "listIUCNProtectedAreaCategories", null);
__decorate([
    swagger_1.ApiOperation({
        description: 'Get protected area by id',
    }),
    swagger_1.ApiOkResponse({
        type: protected_area_geo_entity_1.ProtectedAreaResult,
    }),
    swagger_1.ApiUnauthorizedResponse(),
    swagger_1.ApiForbiddenResponse(),
    json_api_parameters_decorator_1.JSONAPISingleEntityQueryParams(),
    common_1.Get(':id'),
    __param(0, common_1.Param('id', new common_1.ParseUUIDPipe())),
    __param(1, nestjs_base_service_1.ProcessFetchSpecification()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProtectedAreasController.prototype, "findOne", null);
ProtectedAreasController = __decorate([
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiTags(protected_areas_service_1.protectedAreaResource.className),
    common_1.Controller(`${api_config_1.apiGlobalPrefixes.v1}/protected-areas`),
    __metadata("design:paramtypes", [protected_areas_service_1.ProtectedAreasService])
], ProtectedAreasController);
exports.ProtectedAreasController = ProtectedAreasController;
//# sourceMappingURL=protected-areas.controller.js.map