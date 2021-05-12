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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirstApiEventByTopicAndKind = exports.LatestApiEventByTopicAndKind = exports.ApiEventByTopicAndKind = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const typeorm_1 = require("typeorm");
const api_event_api_entity_1 = require("./api-event.api.entity");
class ApiEventByTopicAndKind {
}
__decorate([
    typeorm_1.Column('timestamp without time zone', {
        default: () => 'now()',
    }),
    __metadata("design:type", Date)
], ApiEventByTopicAndKind.prototype, "timestamp", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsEnum(Object.values(api_event_api_entity_1.API_EVENT_KINDS)),
    typeorm_1.PrimaryColumn('enum'),
    __metadata("design:type", String)
], ApiEventByTopicAndKind.prototype, "kind", void 0);
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.PrimaryColumn('uuid'),
    __metadata("design:type", String)
], ApiEventByTopicAndKind.prototype, "topic", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('jsonb'),
    __metadata("design:type", Object)
], ApiEventByTopicAndKind.prototype, "data", void 0);
exports.ApiEventByTopicAndKind = ApiEventByTopicAndKind;
let LatestApiEventByTopicAndKind = class LatestApiEventByTopicAndKind extends ApiEventByTopicAndKind {
};
LatestApiEventByTopicAndKind = __decorate([
    typeorm_1.Entity('latest_api_event_by_topic_and_kind')
], LatestApiEventByTopicAndKind);
exports.LatestApiEventByTopicAndKind = LatestApiEventByTopicAndKind;
let FirstApiEventByTopicAndKind = class FirstApiEventByTopicAndKind extends ApiEventByTopicAndKind {
};
FirstApiEventByTopicAndKind = __decorate([
    typeorm_1.Entity('first_api_event_by_topic_and_kind')
], FirstApiEventByTopicAndKind);
exports.FirstApiEventByTopicAndKind = FirstApiEventByTopicAndKind;
//# sourceMappingURL=api-event.topic+kind.api.entity.js.map