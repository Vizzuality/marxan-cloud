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
exports.TimeUserEntityMetadata = void 0;
const swagger_1 = require("@nestjs/swagger");
const user_api_entity_1 = require("../modules/users/user.api.entity");
const typeorm_1 = require("typeorm");
class TimeUserEntityMetadata {
}
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' }),
    __metadata("design:type", Date)
], TimeUserEntityMetadata.prototype, "createdAt", void 0);
__decorate([
    swagger_1.ApiProperty({ type: () => user_api_entity_1.User }),
    typeorm_1.ManyToOne((_type) => user_api_entity_1.User),
    typeorm_1.JoinColumn({
        name: 'created_by',
        referencedColumnName: 'id',
    }),
    __metadata("design:type", user_api_entity_1.User)
], TimeUserEntityMetadata.prototype, "createdByUser", void 0);
__decorate([
    typeorm_1.Column('uuid', { name: 'created_by' }),
    __metadata("design:type", String)
], TimeUserEntityMetadata.prototype, "createdBy", void 0);
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.UpdateDateColumn({
        name: 'last_modified_at',
        type: 'timestamp without time zone',
    }),
    __metadata("design:type", Date)
], TimeUserEntityMetadata.prototype, "lastModifiedAt", void 0);
exports.TimeUserEntityMetadata = TimeUserEntityMetadata;
//# sourceMappingURL=time-user-entity-metadata.js.map