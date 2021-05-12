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
exports.ScenariosController = void 0;
const common_1 = require("@nestjs/common");
const scenario_api_entity_1 = require("./scenario.api.entity");
const scenarios_service_1 = require("./scenarios.service");
const nestjs_base_service_1 = require("nestjs-base-service");
const swagger_1 = require("@nestjs/swagger");
const api_config_1 = require("../../api.config");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
const json_api_parameters_decorator_1 = require("../../decorators/json-api-parameters.decorator");
const create_scenario_dto_1 = require("./dto/create.scenario.dto");
const update_scenario_dto_1 = require("./dto/update.scenario.dto");
const app_controller_1 = require("../../app.controller");
const scenarios_features_1 = require("../scenarios-features");
const remote_scenario_features_data_geo_entity_1 = require("../scenarios-features/entities/remote-scenario-features-data.geo.entity");
const update_scenario_planning_unit_lock_status_dto_1 = require("./dto/update-scenario-planning-unit-lock-status.dto");
const file_uploads_utils_1 = require("../../utils/file-uploads.utils");
const proxy_service_1 = require("../proxy/proxy.service");
const shapefile_decorator_1 = require("../../decorators/shapefile.decorator");
let ScenariosController = class ScenariosController {
    constructor(service, proxyService, scenarioFeatures) {
        this.service = service;
        this.proxyService = proxyService;
        this.scenarioFeatures = scenarioFeatures;
    }
    async findAll(fetchSpecification) {
        const results = await this.service.findAllPaginated(fetchSpecification, {});
        return this.service.serialize(results.data, results.metadata);
    }
    async findOne(id, fetchSpecification) {
        return await this.service.serialize(await this.service.getById(id, fetchSpecification));
    }
    async create(dto, req) {
        return await this.service.serialize(await this.service.create(dto, { authenticatedUser: req.user }));
    }
    async uploadLockInShapeFile(scenarioId, request, response) {
        await this.service.getById(scenarioId);
        const proxyServiceResponse = await this.proxyService.proxyUploadShapeFile(request, response);
        return proxyServiceResponse;
    }
    async update(id, dto) {
        return await this.service.serialize(await this.service.update(id, dto));
    }
    async delete(id) {
        return await this.service.remove(id);
    }
    async changePlanningUnits(id, input) {
        return;
    }
    async planningUnitsStatus(id) {
        return {
            status: scenario_api_entity_1.JobStatus.running,
        };
    }
    async getScenarioFeatures(id) {
        return this.scenarioFeatures.serialize((await this.scenarioFeatures.findAll(undefined, {
            params: {
                scenarioId: id,
            },
        }))[0]);
    }
};
__decorate([
    swagger_1.ApiOperation({
        description: 'Find all scenarios',
    }),
    swagger_1.ApiOkResponse({
        type: scenario_api_entity_1.ScenarioResult,
    }),
    json_api_parameters_decorator_1.JSONAPIQueryParams({
        entitiesAllowedAsIncludes: scenario_api_entity_1.scenarioResource.entitiesAllowedAsIncludes,
        availableFilters: [
            { name: 'name' },
            { name: 'type' },
            { name: 'projectId' },
            { name: 'status' },
        ],
    }),
    common_1.Get(),
    __param(0, nestjs_base_service_1.ProcessFetchSpecification()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScenariosController.prototype, "findAll", null);
__decorate([
    swagger_1.ApiOperation({ description: 'Find scenario by id' }),
    swagger_1.ApiOkResponse({ type: scenario_api_entity_1.ScenarioResult }),
    json_api_parameters_decorator_1.JSONAPISingleEntityQueryParams({
        entitiesAllowedAsIncludes: scenario_api_entity_1.scenarioResource.entitiesAllowedAsIncludes,
    }),
    common_1.Get(':id'),
    __param(0, common_1.Param('id', common_1.ParseUUIDPipe)),
    __param(1, nestjs_base_service_1.ProcessFetchSpecification()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ScenariosController.prototype, "findOne", null);
__decorate([
    swagger_1.ApiOperation({ description: 'Create scenario' }),
    swagger_1.ApiCreatedResponse({ type: scenario_api_entity_1.ScenarioResult }),
    common_1.Post(),
    __param(0, common_1.Body(new common_1.ValidationPipe())),
    __param(1, common_1.Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_scenario_dto_1.CreateScenarioDTO, Object]),
    __metadata("design:returntype", Promise)
], ScenariosController.prototype, "create", null);
__decorate([
    shapefile_decorator_1.ApiConsumesShapefile(),
    common_1.Post(':id/planning-unit-shapefile'),
    __param(0, common_1.Param('id')),
    __param(1, common_1.Req()),
    __param(2, common_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ScenariosController.prototype, "uploadLockInShapeFile", null);
__decorate([
    swagger_1.ApiOperation({ description: 'Update scenario' }),
    swagger_1.ApiOkResponse({ type: scenario_api_entity_1.ScenarioResult }),
    common_1.Patch(':id'),
    __param(0, common_1.Param('id')),
    __param(1, common_1.Body(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_scenario_dto_1.UpdateScenarioDTO]),
    __metadata("design:returntype", Promise)
], ScenariosController.prototype, "update", null);
__decorate([
    swagger_1.ApiOperation({ description: 'Delete scenario' }),
    swagger_1.ApiOkResponse(),
    common_1.Delete(':id'),
    __param(0, common_1.Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScenariosController.prototype, "delete", null);
__decorate([
    common_1.Patch(':id/planning-units'),
    swagger_1.ApiOkResponse(),
    __param(0, common_1.Param('id', common_1.ParseUUIDPipe)),
    __param(1, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_scenario_planning_unit_lock_status_dto_1.UpdateScenarioPlanningUnitLockStatusDto]),
    __metadata("design:returntype", Promise)
], ScenariosController.prototype, "changePlanningUnits", null);
__decorate([
    common_1.Get(':id/planning-units'),
    __param(0, common_1.Param('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScenariosController.prototype, "planningUnitsStatus", null);
__decorate([
    swagger_1.ApiOperation({ description: `Resolve scenario's features pre-gap data.` }),
    swagger_1.ApiOkResponse({
        type: remote_scenario_features_data_geo_entity_1.RemoteScenarioFeaturesData,
    }),
    common_1.Get(':id/features'),
    __param(0, common_1.Param('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScenariosController.prototype, "getScenarioFeatures", null);
ScenariosController = __decorate([
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiTags(scenario_api_entity_1.scenarioResource.className),
    common_1.Controller(`${api_config_1.apiGlobalPrefixes.v1}/scenarios`),
    __metadata("design:paramtypes", [scenarios_service_1.ScenariosService,
        proxy_service_1.ProxyService,
        scenarios_features_1.ScenarioFeaturesService])
], ScenariosController);
exports.ScenariosController = ScenariosController;
//# sourceMappingURL=scenarios.controller.js.map