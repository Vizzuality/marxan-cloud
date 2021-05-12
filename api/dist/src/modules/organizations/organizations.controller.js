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
exports.OrganizationsController = void 0;
const common_1 = require("@nestjs/common");
const organization_api_entity_1 = require("./organization.api.entity");
const organizations_service_1 = require("./organizations.service");
const swagger_1 = require("@nestjs/swagger");
const api_config_1 = require("../../api.config");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
const common_2 = require("@nestjs/common");
const json_api_parameters_decorator_1 = require("../../decorators/json-api-parameters.decorator");
const create_organization_dto_1 = require("./dto/create.organization.dto");
const update_organization_dto_1 = require("./dto/update.organization.dto");
const app_controller_1 = require("../../app.controller");
const nestjs_base_service_1 = require("nestjs-base-service");
let OrganizationsController = class OrganizationsController {
    constructor(service) {
        this.service = service;
    }
    async findAll(fetchSpecification) {
        const results = await this.service.findAllPaginated(fetchSpecification);
        return this.service.serialize(results.data, results.metadata);
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
        description: 'Find all organizations',
    }),
    swagger_1.ApiOkResponse({
        type: organization_api_entity_1.OrganizationResultPlural,
    }),
    swagger_1.ApiUnauthorizedResponse({
        description: 'Unauthorized.',
    }),
    swagger_1.ApiForbiddenResponse({
        description: 'The current user does not have suitable permissions for this request.',
    }),
    json_api_parameters_decorator_1.JSONAPIQueryParams({
        entitiesAllowedAsIncludes: organization_api_entity_1.organizationResource.entitiesAllowedAsIncludes,
        availableFilters: [{ name: 'name' }],
    }),
    common_1.Get(),
    __param(0, nestjs_base_service_1.ProcessFetchSpecification()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "findAll", null);
__decorate([
    swagger_1.ApiOperation({ description: 'Find organization by id' }),
    swagger_1.ApiOkResponse({ type: organization_api_entity_1.OrganizationResultSingular }),
    json_api_parameters_decorator_1.JSONAPISingleEntityQueryParams({
        entitiesAllowedAsIncludes: organization_api_entity_1.organizationResource.entitiesAllowedAsIncludes,
        availableFilters: [{ name: 'name' }],
    }),
    common_1.Get(':id'),
    __param(0, common_1.Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "findOne", null);
__decorate([
    swagger_1.ApiOperation({ description: 'Create organization' }),
    swagger_1.ApiCreatedResponse({ type: organization_api_entity_1.OrganizationResultSingular }),
    common_2.Post(),
    __param(0, common_1.Body()),
    __param(1, common_1.Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_organization_dto_1.CreateOrganizationDTO, Object]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "create", null);
__decorate([
    swagger_1.ApiOperation({ description: 'Update organization' }),
    swagger_1.ApiOkResponse({ type: organization_api_entity_1.OrganizationResultSingular }),
    common_1.Patch(':id'),
    __param(0, common_1.Param('id')),
    __param(1, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_organization_dto_1.UpdateOrganizationDTO]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "update", null);
__decorate([
    swagger_1.ApiOperation({ description: 'Delete organization' }),
    swagger_1.ApiOkResponse(),
    common_1.Delete(':id'),
    __param(0, common_1.Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationsController.prototype, "delete", null);
OrganizationsController = __decorate([
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiTags(organization_api_entity_1.organizationResource.className),
    common_1.Controller(`${api_config_1.apiGlobalPrefixes.v1}/organizations`),
    __metadata("design:paramtypes", [organizations_service_1.OrganizationsService])
], OrganizationsController);
exports.OrganizationsController = OrganizationsController;
//# sourceMappingURL=organizations.controller.js.map