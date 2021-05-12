"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiEventsModule = exports.logger = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const api_event_api_entity_1 = require("./api-event.api.entity");
const api_event_topic_kind_api_entity_1 = require("./api-event.topic+kind.api.entity");
const api_events_controller_1 = require("./api-events.controller");
const api_events_service_1 = require("./api-events.service");
exports.logger = new common_1.Logger('ApiEvents');
let ApiEventsModule = class ApiEventsModule {
};
ApiEventsModule = __decorate([
    common_1.Module({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                api_event_api_entity_1.ApiEvent,
                api_event_topic_kind_api_entity_1.LatestApiEventByTopicAndKind,
                api_event_topic_kind_api_entity_1.FirstApiEventByTopicAndKind,
            ]),
        ],
        providers: [api_events_service_1.ApiEventsService],
        controllers: [api_events_controller_1.ApiEventsController],
        exports: [api_events_service_1.ApiEventsService],
    })
], ApiEventsModule);
exports.ApiEventsModule = ApiEventsModule;
//# sourceMappingURL=api-events.module.js.map