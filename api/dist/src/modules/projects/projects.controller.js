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
exports.ProjectsController = void 0;
const common_1 = require("@nestjs/common");
const project_api_entity_1 = require("./project.api.entity");
const projects_service_1 = require("./projects.service");
const swagger_1 = require("@nestjs/swagger");
const api_config_1 = require("../../api.config");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
const common_2 = require("@nestjs/common");
const common_3 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const file_uploads_utils_1 = require("../../utils/file-uploads.utils");
const json_api_parameters_decorator_1 = require("../../decorators/json-api-parameters.decorator");
const project_api_entity_2 = require("./project.api.entity");
const update_project_dto_1 = require("./dto/update.project.dto");
const create_project_dto_1 = require("./dto/create.project.dto");
const app_controller_1 = require("../../app.controller");
const nestjs_base_service_1 = require("nestjs-base-service");
const geo_feature_api_entity_1 = require("../geo-features/geo-feature.api.entity");
const geo_features_service_1 = require("../geo-features/geo-features.service");
let ProjectsController = class ProjectsController {
    constructor(service, geoFeaturesService) {
        this.service = service;
        this.geoFeaturesService = geoFeaturesService;
    }
    async findAllGeoFeaturesForProject(fetchSpecification, params, featureClassAndAliasFilter) {
        const results = await this.geoFeaturesService.findAllPaginated(fetchSpecification, {
            params: Object.assign(Object.assign({}, params), { featureClassAndAliasFilter: featureClassAndAliasFilter }),
        });
        return this.geoFeaturesService.serialize(results.data, results.metadata);
    }
    async importLegacyProject(file) {
        return this.service.importLegacyProject(file);
    }
    async findAll(fetchSpecification) {
        const results = await this.service.findAllPaginated(fetchSpecification);
        return await this.service.serialize(results.data, results.metadata);
    }
    async findOne(id) {
        return await this.service.serialize(await this.service.getById(id));
    }
    async create(dto, req) {
        return await this.service.serialize(await this.service.create(dto, { authenticatedUser: req.user }));
    }
    async update(id, dto) {
        return await this.service.serialize(await this.service.update(id, dto));
    }
    async delete(id) {
        return await this.service.remove(id);
    }
};
__decorate([
    swagger_1.ApiOperation({
        description: 'Find all geo features',
    }),
    swagger_1.ApiOkResponse({
        type: geo_feature_api_entity_1.GeoFeatureResult,
    }),
    swagger_1.ApiUnauthorizedResponse(),
    swagger_1.ApiForbiddenResponse(),
    json_api_parameters_decorator_1.JSONAPIQueryParams(),
    common_1.Get(':projectId/features'),
    __param(0, nestjs_base_service_1.ProcessFetchSpecification()),
    __param(1, common_1.Param()),
    __param(2, common_1.Query('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "findAllGeoFeaturesForProject", null);
__decorate([
    swagger_1.ApiOperation({
        description: 'Import a Marxan project via file upload',
        summary: 'Import a Marxan project',
    }),
    common_3.UseInterceptors(platform_express_1.FileInterceptor('file', file_uploads_utils_1.uploadOptions)),
    common_2.Post('legacy'),
    __param(0, common_1.UploadedFile()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "importLegacyProject", null);
__decorate([
    swagger_1.ApiOperation({
        description: 'Find all projects',
    }),
    swagger_1.ApiOkResponse({ type: project_api_entity_1.ProjectResultPlural }),
    json_api_parameters_decorator_1.JSONAPIQueryParams({
        entitiesAllowedAsIncludes: project_api_entity_2.projectResource.entitiesAllowedAsIncludes,
        availableFilters: [
            { name: 'name' },
            { name: 'organizationId' },
            { name: 'countryId' },
            { name: 'adminAreaLevel1Id' },
            { name: 'adminAreaLevel21Id' },
        ],
    }),
    common_1.Get(),
    __param(0, nestjs_base_service_1.ProcessFetchSpecification()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "findAll", null);
__decorate([
    swagger_1.ApiOperation({ description: 'Find project by id' }),
    swagger_1.ApiOkResponse({ type: project_api_entity_1.ProjectResultSingular }),
    json_api_parameters_decorator_1.JSONAPISingleEntityQueryParams({
        entitiesAllowedAsIncludes: project_api_entity_2.projectResource.entitiesAllowedAsIncludes,
    }),
    common_1.Get(':id'),
    __param(0, common_1.Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "findOne", null);
__decorate([
    swagger_1.ApiOperation({ description: 'Create project' }),
    swagger_1.ApiOkResponse({ type: project_api_entity_1.ProjectResultSingular }),
    common_2.Post(),
    __param(0, common_1.Body()),
    __param(1, common_1.Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_project_dto_1.CreateProjectDTO, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "create", null);
__decorate([
    swagger_1.ApiOperation({ description: 'Update project' }),
    swagger_1.ApiOkResponse({ type: project_api_entity_1.ProjectResultSingular }),
    common_1.Patch(':id'),
    __param(0, common_1.Param('id')),
    __param(1, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_project_dto_1.UpdateProjectDTO]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "update", null);
__decorate([
    swagger_1.ApiOperation({ description: 'Delete project' }),
    swagger_1.ApiOkResponse(),
    common_1.Delete(':id'),
    __param(0, common_1.Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "delete", null);
ProjectsController = __decorate([
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiTags(project_api_entity_2.projectResource.className),
    common_1.Controller(`${api_config_1.apiGlobalPrefixes.v1}/projects`),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService,
        geo_features_service_1.GeoFeaturesService])
], ProjectsController);
exports.ProjectsController = ProjectsController;
//# sourceMappingURL=projects.controller.js.map