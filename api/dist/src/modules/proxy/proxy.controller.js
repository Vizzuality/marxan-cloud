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
exports.ProxyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
const api_config_1 = require("../../api.config");
const proxy_service_1 = require("./proxy.service");
let ProxyController = class ProxyController {
    constructor(proxyService) {
        this.proxyService = proxyService;
    }
    async proxyAdminAreaTile(request, response) {
        return this.proxyService.proxyTileRequest(request, response);
    }
    async proxyProtectedAreaTile(request, response) {
        return this.proxyService.proxyTileRequest(request, response);
    }
    async proxyFeaturesTile(request, response) {
        return this.proxyService.proxyTileRequest(request, response);
    }
};
__decorate([
    swagger_1.ApiOperation({
        description: 'Find administrative areas within a given country in mvt format.',
    }),
    swagger_1.ApiOkResponse({
        type: 'mvt',
    }),
    swagger_1.ApiUnauthorizedResponse(),
    swagger_1.ApiForbiddenResponse(),
    swagger_1.ApiParam({
        name: 'z',
        description: 'The zoom level ranging from 0 - 20',
        type: Number,
        required: true,
    }),
    swagger_1.ApiParam({
        name: 'x',
        description: 'The tile x offset on Mercator Projection',
        type: Number,
        required: true,
    }),
    swagger_1.ApiParam({
        name: 'y',
        description: 'The tile y offset on Mercator Projection',
        type: Number,
        required: true,
    }),
    swagger_1.ApiParam({
        name: 'level',
        description: 'Specific level to filter the administrative areas (0, 1 or 2)',
        type: Number,
        required: true,
        example: '1',
    }),
    swagger_1.ApiQuery({
        name: 'guid',
        description: 'Parent country of administrative areas in ISO code',
        type: String,
        required: false,
        example: 'BRA.1',
    }),
    common_1.Get('/administrative-areas/:level/preview/tiles/:z/:x/:y.mvt'),
    __param(0, common_1.Req()), __param(1, common_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "proxyAdminAreaTile", null);
__decorate([
    swagger_1.ApiOperation({
        description: 'Get tile for protected areas.',
    }),
    swagger_1.ApiOkResponse({
        type: 'mvt',
    }),
    swagger_1.ApiUnauthorizedResponse(),
    swagger_1.ApiForbiddenResponse(),
    swagger_1.ApiParam({
        name: 'z',
        description: 'The zoom level ranging from 0 - 20',
        type: Number,
        required: true,
    }),
    swagger_1.ApiParam({
        name: 'x',
        description: 'The tile x offset on Mercator Projection',
        type: Number,
        required: true,
    }),
    swagger_1.ApiParam({
        name: 'y',
        description: 'The tile y offset on Mercator Projection',
        type: Number,
        required: true,
    }),
    swagger_1.ApiQuery({
        name: 'id',
        description: 'Id of WDPA area',
        type: String,
        required: false,
        example: 'e5c3b978-908c-49d3-b1e3-89727e9f999c',
    }),
    common_1.Get('/protected-areas/preview/tiles/:z/:x/:y.mvt'),
    __param(0, common_1.Req()),
    __param(1, common_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "proxyProtectedAreaTile", null);
__decorate([
    swagger_1.ApiOperation({
        description: 'Get tile for a feature by id.',
    }),
    swagger_1.ApiOkResponse({
        type: 'mvt',
    }),
    swagger_1.ApiUnauthorizedResponse(),
    swagger_1.ApiForbiddenResponse(),
    swagger_1.ApiParam({
        name: 'z',
        description: 'The zoom level ranging from 0 - 20',
        type: Number,
        required: true,
    }),
    swagger_1.ApiParam({
        name: 'x',
        description: 'The tile x offset on Mercator Projection',
        type: Number,
        required: true,
    }),
    swagger_1.ApiParam({
        name: 'y',
        description: 'The tile y offset on Mercator Projection',
        type: Number,
        required: true,
    }),
    swagger_1.ApiParam({
        name: 'id',
        description: 'Specific id of the feature',
        type: String,
        required: true,
    }),
    swagger_1.ApiQuery({
        name: 'bbox',
        description: 'Bounding box of the project',
        type: Array,
        required: false,
        example: [-1, 40, 1, 42],
    }),
    common_1.Get('/features/:id/preview/tiles/:z/:x/:y.mvt'),
    __param(0, common_1.Req()), __param(1, common_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyController.prototype, "proxyFeaturesTile", null);
ProxyController = __decorate([
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiTags('Vector tile proxy'),
    common_1.Controller(`${api_config_1.apiGlobalPrefixes.v1}`),
    __metadata("design:paramtypes", [proxy_service_1.ProxyService])
], ProxyController);
exports.ProxyController = ProxyController;
//# sourceMappingURL=proxy.controller.js.map