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
exports.ApiEventsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const api_event_api_entity_1 = require("./api-event.api.entity");
const api_event_topic_kind_api_entity_1 = require("./api-event.topic+kind.api.entity");
const lodash_1 = require("lodash");
const app_base_service_1 = require("../../utils/app-base.service");
const info_dto_1 = require("../../dto/info.dto");
const config_utils_1 = require("../../utils/config.utils");
let ApiEventsService = class ApiEventsService extends app_base_service_1.AppBaseService {
    constructor(repo, latestEventByTopicAndKindRepo) {
        super(repo, api_event_api_entity_1.apiEventResource.name.singular, api_event_api_entity_1.apiEventResource.name.plural, {
            logging: { muteAll: config_utils_1.AppConfig.get('logging.muteAll', false) },
        });
        this.repo = repo;
        this.latestEventByTopicAndKindRepo = latestEventByTopicAndKindRepo;
    }
    get serializerConfig() {
        return {
            attributes: ['timestamp', 'topic', 'kind', 'data'],
            keyForAttribute: 'camelCase',
        };
    }
    async getLatestEventForTopic(qualifiedTopic) {
        const result = await this.latestEventByTopicAndKindRepo.findOne({
            topic: qualifiedTopic.topic,
            kind: qualifiedTopic.kind,
        });
        if (!result) {
            throw new common_1.NotFoundException(`No events found for topic ${qualifiedTopic.topic} and kind ${qualifiedTopic.kind}.`);
        }
        return result;
    }
    async purgeAll(qualifiedTopic) {
        if (!lodash_1.isNil(qualifiedTopic)) {
            this.logger.log(`Purging events for topic ${qualifiedTopic.topic}/${qualifiedTopic.kind}}`);
            return this.repo.delete({
                topic: qualifiedTopic.topic,
                kind: qualifiedTopic.kind,
            });
        }
        else {
            this.logger.log(`Purging events`);
            await this.repo.clear();
            return new typeorm_2.DeleteResult();
        }
    }
};
ApiEventsService = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(api_event_api_entity_1.ApiEvent)),
    __param(1, typeorm_1.InjectRepository(api_event_topic_kind_api_entity_1.LatestApiEventByTopicAndKind)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ApiEventsService);
exports.ApiEventsService = ApiEventsService;
//# sourceMappingURL=api-events.service.js.map