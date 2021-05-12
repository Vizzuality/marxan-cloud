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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const user_api_entity_1 = require("./user.api.entity");
const users_service_1 = require("./users.service");
const swagger_1 = require("@nestjs/swagger");
const api_config_1 = require("../../api.config");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
const app_controller_1 = require("../../app.controller");
const json_api_parameters_decorator_1 = require("../../decorators/json-api-parameters.decorator");
const nestjs_base_service_1 = require("nestjs-base-service");
const update_user_dto_1 = require("./dto/update.user.dto");
const update_user_password_1 = require("./dto/update.user-password");
let UsersController = class UsersController {
    constructor(service) {
        this.service = service;
    }
    async findAll(fetchSpecification) {
        const results = await this.service.findAllPaginated(fetchSpecification);
        return this.service.serialize(results.data, results.metadata);
    }
    async updateOwnPassword(dto, req) {
        return await this.service.updateOwnPassword(req.user.id, dto, {
            authenticatedUser: req.user,
        });
    }
    async update(dto, req) {
        return this.service.serialize(await this.service.update(req.user.id, dto, {
            authenticatedUser: req.user,
        }));
    }
    async userMetadata(req) {
        return this.service.serialize(await this.service.getById(req.user.id));
    }
    async deleteOwnUser(req) {
        return this.service.markAsDeleted(req.user.id);
    }
};
__decorate([
    swagger_1.ApiOperation({
        description: 'Find all users',
    }),
    swagger_1.ApiResponse({
        type: user_api_entity_1.User,
    }),
    swagger_1.ApiUnauthorizedResponse({
        description: 'Unauthorized.',
    }),
    swagger_1.ApiForbiddenResponse({
        description: 'The current user does not have suitable permissions for this request.',
    }),
    json_api_parameters_decorator_1.JSONAPIQueryParams({
        entitiesAllowedAsIncludes: user_api_entity_1.userResource.entitiesAllowedAsIncludes,
    }),
    common_1.Get(),
    __param(0, nestjs_base_service_1.ProcessFetchSpecification()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    swagger_1.ApiOperation({
        description: 'Update the password of a user, if they can present the current one.',
    }),
    swagger_1.ApiOkResponse({ type: user_api_entity_1.UserResult }),
    common_1.Patch('me/password'),
    __param(0, common_1.Body(new common_1.ValidationPipe())),
    __param(1, common_1.Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_user_password_1.UpdateUserPasswordDTO, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateOwnPassword", null);
__decorate([
    swagger_1.ApiOperation({ description: 'Update a user.' }),
    swagger_1.ApiOkResponse({ type: user_api_entity_1.UserResult }),
    common_1.Patch('me'),
    __param(0, common_1.Body(new common_1.ValidationPipe({ forbidNonWhitelisted: true }))),
    __param(1, common_1.Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_user_dto_1.UpdateUserDTO, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    swagger_1.ApiOperation({
        description: 'Retrieve attributes of the current user',
    }),
    swagger_1.ApiResponse({
        type: user_api_entity_1.UserResult,
    }),
    swagger_1.ApiUnauthorizedResponse({
        description: 'Unauthorized.',
    }),
    swagger_1.ApiForbiddenResponse({
        description: 'The current user does not have suitable permissions for this request.',
    }),
    common_1.Get('me'),
    __param(0, common_1.Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "userMetadata", null);
__decorate([
    swagger_1.ApiOperation({
        description: 'Mark user as deleted.',
    }),
    swagger_1.ApiOkResponse(),
    swagger_1.ApiUnauthorizedResponse(),
    swagger_1.ApiForbiddenResponse(),
    common_1.Delete('me'),
    __param(0, common_1.Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteOwnUser", null);
UsersController = __decorate([
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiTags(user_api_entity_1.userResource.className),
    common_1.Controller(`${api_config_1.apiGlobalPrefixes.v1}/users`),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
exports.UsersController = UsersController;
//# sourceMappingURL=users.controller.js.map