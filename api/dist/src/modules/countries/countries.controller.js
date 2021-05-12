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
exports.CountriesController = void 0;
const common_1 = require("@nestjs/common");
const country_geo_entity_1 = require("./country.geo.entity");
const countries_service_1 = require("./countries.service");
const swagger_1 = require("@nestjs/swagger");
const api_config_1 = require("../../api.config");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
const json_api_parameters_decorator_1 = require("../../decorators/json-api-parameters.decorator");
const nestjs_base_service_1 = require("nestjs-base-service");
let CountriesController = class CountriesController {
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
};
__decorate([
    swagger_1.ApiOperation({
        description: 'Find all countries',
    }),
    swagger_1.ApiOkResponse({
        type: country_geo_entity_1.CountryResult,
    }),
    swagger_1.ApiUnauthorizedResponse(),
    swagger_1.ApiForbiddenResponse(),
    json_api_parameters_decorator_1.JSONAPIQueryParams(),
    common_1.Get(),
    __param(0, nestjs_base_service_1.ProcessFetchSpecification()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CountriesController.prototype, "findAll", null);
__decorate([
    swagger_1.ApiOperation({ description: 'Find country by id' }),
    swagger_1.ApiOkResponse({ type: country_geo_entity_1.CountryResult }),
    json_api_parameters_decorator_1.JSONAPISingleEntityQueryParams(),
    common_1.Get(':id'),
    __param(0, common_1.Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CountriesController.prototype, "findOne", null);
CountriesController = __decorate([
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiTags(country_geo_entity_1.countryResource.className),
    common_1.Controller(`${api_config_1.apiGlobalPrefixes.v1}/countries`),
    __metadata("design:paramtypes", [countries_service_1.CountriesService])
], CountriesController);
exports.CountriesController = CountriesController;
//# sourceMappingURL=countries.controller.js.map