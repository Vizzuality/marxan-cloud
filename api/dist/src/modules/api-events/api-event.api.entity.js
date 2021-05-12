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
exports.ApiEventResult = exports.JSONAPIApiEventData = exports.ApiEvent = exports.API_EVENT_KINDS = exports.apiEventResource = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const typeorm_1 = require("typeorm");
const resource_interface_1 = require("../../types/resource.interface");
exports.apiEventResource = {
    className: 'ApiEvent',
    name: {
        singular: 'api_event',
        plural: 'api_events',
    },
};
var API_EVENT_KINDS;
(function (API_EVENT_KINDS) {
    API_EVENT_KINDS["user__signedUp__v1alpha1"] = "user.signedUp/v1alpha1";
    API_EVENT_KINDS["user__accountActivationTokenGenerated__v1alpha1"] = "user.accountActivationTokenGenerated/v1alpha1";
    API_EVENT_KINDS["user__accountActivationSucceeded__v1alpha1"] = "user.accountActivationSucceeded/v1alpha1";
    API_EVENT_KINDS["user__accountActivationFailed__v1alpha1"] = "user.accountActivationFailed/v1alpha1";
    API_EVENT_KINDS["user__passwordResetTokenGenerated__v1alpha1"] = "user.passwordResetTokenGenerated/v1alpha1";
    API_EVENT_KINDS["user__passwordResetSucceeded__v1alpha1"] = "user.passwordResetSucceeded/v1alpha1";
    API_EVENT_KINDS["user__passwordResetFailed__v1alpha1"] = "user.passwordResetFailed/v1alpha1";
})(API_EVENT_KINDS = exports.API_EVENT_KINDS || (exports.API_EVENT_KINDS = {}));
let ApiEvent = class ApiEvent {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], ApiEvent.prototype, "id", void 0);
__decorate([
    typeorm_1.Column('timestamp', {
        default: () => 'now()',
    }),
    __metadata("design:type", Date)
], ApiEvent.prototype, "timestamp", void 0);
__decorate([
    swagger_1.ApiProperty(),
    class_validator_1.IsEnum(Object.values(API_EVENT_KINDS)),
    typeorm_1.Column('enum'),
    __metadata("design:type", String)
], ApiEvent.prototype, "kind", void 0);
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.Column('uuid'),
    __metadata("design:type", String)
], ApiEvent.prototype, "topic", void 0);
__decorate([
    typeorm_1.Column('jsonb'),
    __metadata("design:type", Object)
], ApiEvent.prototype, "data", void 0);
ApiEvent = __decorate([
    typeorm_1.Entity('api_events')
], ApiEvent);
exports.ApiEvent = ApiEvent;
class JSONAPIApiEventData {
    constructor() {
        this.type = 'countries';
    }
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Object)
], JSONAPIApiEventData.prototype, "type", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], JSONAPIApiEventData.prototype, "id", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", ApiEvent)
], JSONAPIApiEventData.prototype, "attributes", void 0);
exports.JSONAPIApiEventData = JSONAPIApiEventData;
class ApiEventResult {
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", JSONAPIApiEventData)
], ApiEventResult.prototype, "data", void 0);
exports.ApiEventResult = ApiEventResult;
//# sourceMappingURL=api-event.api.entity.js.map