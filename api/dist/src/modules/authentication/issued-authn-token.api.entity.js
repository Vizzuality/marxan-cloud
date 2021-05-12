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
exports.IssuedAuthnToken = void 0;
const user_api_entity_1 = require("../users/user.api.entity");
const typeorm_1 = require("typeorm");
let IssuedAuthnToken = class IssuedAuthnToken {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], IssuedAuthnToken.prototype, "id", void 0);
__decorate([
    typeorm_1.ManyToOne((_type) => user_api_entity_1.User, (user) => user.issuedAuthnTokens),
    typeorm_1.JoinColumn({
        name: 'user_id',
        referencedColumnName: 'id',
    }),
    __metadata("design:type", String)
], IssuedAuthnToken.prototype, "userId", void 0);
__decorate([
    typeorm_1.Column('timestamp'),
    __metadata("design:type", Date)
], IssuedAuthnToken.prototype, "exp", void 0);
__decorate([
    typeorm_1.Column('timestamp', { name: 'created_at' }),
    __metadata("design:type", Date)
], IssuedAuthnToken.prototype, "createdAt", void 0);
IssuedAuthnToken = __decorate([
    typeorm_1.Entity('issued_authn_tokens')
], IssuedAuthnToken);
exports.IssuedAuthnToken = IssuedAuthnToken;
//# sourceMappingURL=issued-authn-token.api.entity.js.map