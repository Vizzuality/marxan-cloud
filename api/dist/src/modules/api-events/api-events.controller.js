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
exports.ApiEventsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const api_config_1 = require("../../api.config");
const app_controller_1 = require("../../app.controller");
const json_api_parameters_decorator_1 = require("../../decorators/json-api-parameters.decorator");
const nestjs_base_service_1 = require("nestjs-base-service");
const api_event_api_entity_1 = require("./api-event.api.entity");
const api_events_service_1 = require("./api-events.service");
const create_api_event_dto_1 = require("./dto/create.api-event.dto");
let ApiEventsController = class ApiEventsController {
    constructor(service) {
        this.service = service;
    }
    async findAll(fetchSpecification) {
        const results = await this.service.findAllPaginated(fetchSpecification);
        return this.service.serialize(results.data, results.metadata);
    }
    async findLatestEventByKindAndTopic(kind, topic) {
        return await this.service.serialize((await this.service.getLatestEventForTopic({ topic, kind })));
    }
    async create(dto, req) {
        return await this.service.serialize(await this.service.create(dto, { authenticatedUser: req.user }));
    }
    async deleteEventSeriesByKindAndTopic(kind, topic) {
        return await this.service.purgeAll({ kind, topic });
    }
};
__decorate([
    swagger_1.ApiOperation({
        description: 'Find all API events',
    }),
    swagger_1.ApiOkResponse({
        type: api_event_api_entity_1.ApiEventResult,
    }),
    swagger_1.ApiUnauthorizedResponse(),
    swagger_1.ApiForbiddenResponse(),
    json_api_parameters_decorator_1.JSONAPIQueryParams(),
    common_1.Get(),
    __param(0, nestjs_base_service_1.ProcessFetchSpecification()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApiEventsController.prototype, "findAll", null);
__decorate([
    swagger_1.ApiOperation({
        description: 'Find latest API event by kind for a given topic',
    }),
    swagger_1.ApiOkResponse({ type: api_event_api_entity_1.ApiEvent }),
    common_1.Get('kind/:kind/topic/:topic/latest'),
    __param(0, common_1.Param('kind')),
    __param(1, common_1.Param('topic')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ApiEventsController.prototype, "findLatestEventByKindAndTopic", null);
__decorate([
    swagger_1.ApiOperation({ description: 'Create an API event' }),
    swagger_1.ApiOkResponse({ type: api_event_api_entity_1.ApiEvent }),
    common_1.Post(),
    __param(0, common_1.Body()),
    __param(1, common_1.Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_api_event_dto_1.CreateApiEventDTO, Object]),
    __metadata("design:returntype", Promise)
], ApiEventsController.prototype, "create", null);
__decorate([
    swagger_1.ApiOperation({
        description: 'Delete API event series by kind for a given topic',
    }),
    swagger_1.ApiOkResponse({ type: api_event_api_entity_1.ApiEvent }),
    common_1.Delete('kind/:kind/topic/:topic'),
    __param(0, common_1.Param('kind')),
    __param(1, common_1.Param('topic')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ApiEventsController.prototype, "deleteEventSeriesByKindAndTopic", null);
ApiEventsController = __decorate([
    common_1.Controller(`${api_config_1.apiGlobalPrefixes.v1}/api-events`),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiTags('ApiEvents'),
    swagger_1.ApiBearerAuth(),
    __metadata("design:paramtypes", [api_events_service_1.ApiEventsService])
], ApiEventsController);
exports.ApiEventsController = ApiEventsController;
//# sourceMappingURL=api-events.controller.js.map