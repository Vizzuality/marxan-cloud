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
exports.CreateApiEventDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const api_event_api_entity_1 = require("../api-event.api.entity");
const ApiEventsUserData = require("./apiEvents.user.data.dto");
class CreateApiEventDTO {
}
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsEnum(Object.values(api_event_api_entity_1.API_EVENT_KINDS)),
    __metadata("design:type", String)
], CreateApiEventDTO.prototype, "kind", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsUUID(4),
    __metadata("design:type", String)
], CreateApiEventDTO.prototype, "topic", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    class_validator_1.IsJSON(),
    class_validator_1.IsOptional(),
    __metadata("design:type", Object)
], CreateApiEventDTO.prototype, "data", void 0);
exports.CreateApiEventDTO = CreateApiEventDTO;
//# sourceMappingURL=create.api-event.dto.js.map