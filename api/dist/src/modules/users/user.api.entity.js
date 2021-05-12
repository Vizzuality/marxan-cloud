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
exports.UserResult = exports.JSONAPIUserData = exports.User = exports.userResource = void 0;
const swagger_1 = require("@nestjs/swagger");
const issued_authn_token_api_entity_1 = require("../authentication/issued-authn-token.api.entity");
const typeorm_1 = require("typeorm");
const project_api_entity_1 = require("../projects/project.api.entity");
const scenario_api_entity_1 = require("../scenarios/scenario.api.entity");
exports.userResource = {
    className: 'User',
    name: {
        singular: 'user',
        plural: 'users',
    },
    entitiesAllowedAsIncludes: ['projects'],
};
let User = class User {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.Column('character varying'),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('character varying', { name: 'display_name' }),
    __metadata("design:type", Object)
], User.prototype, "displayName", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('character varying'),
    __metadata("design:type", Object)
], User.prototype, "fname", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('character varying'),
    __metadata("design:type", Object)
], User.prototype, "lname", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('character varying', { name: 'avatar_data_url' }),
    __metadata("design:type", String)
], User.prototype, "avatarDataUrl", void 0);
__decorate([
    typeorm_1.Column('character varying', { name: 'password_hash' }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('jsonb'),
    __metadata("design:type", Object)
], User.prototype, "metadata", void 0);
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.Column('boolean', { name: 'is_active' }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.Column('boolean', { name: 'is_deleted' }),
    __metadata("design:type", Boolean)
], User.prototype, "isDeleted", void 0);
__decorate([
    swagger_1.ApiProperty({ type: () => project_api_entity_1.Project, isArray: true }),
    typeorm_1.ManyToMany((_type) => project_api_entity_1.Project, (project) => project.users, { eager: false }),
    typeorm_1.JoinTable({
        name: 'users_projects',
        joinColumn: {
            name: 'user_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'project_id',
            referencedColumnName: 'id',
        },
    }),
    __metadata("design:type", Array)
], User.prototype, "projects", void 0);
__decorate([
    swagger_1.ApiProperty({ type: () => scenario_api_entity_1.Scenario, isArray: true }),
    typeorm_1.ManyToMany((_type) => scenario_api_entity_1.Scenario, (scenario) => scenario.users, {
        eager: false,
    }),
    typeorm_1.JoinTable({
        name: 'users_scenarios',
        joinColumn: {
            name: 'user_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'scenario_id',
            referencedColumnName: 'id',
        },
    }),
    __metadata("design:type", Array)
], User.prototype, "scenarios", void 0);
__decorate([
    typeorm_1.OneToMany((_type) => issued_authn_token_api_entity_1.IssuedAuthnToken, (token) => token.userId),
    __metadata("design:type", Array)
], User.prototype, "issuedAuthnTokens", void 0);
User = __decorate([
    typeorm_1.Entity('users')
], User);
exports.User = User;
class JSONAPIUserData {
    constructor() {
        this.type = exports.userResource.name.plural;
    }
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Object)
], JSONAPIUserData.prototype, "type", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], JSONAPIUserData.prototype, "id", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", User)
], JSONAPIUserData.prototype, "attributes", void 0);
exports.JSONAPIUserData = JSONAPIUserData;
class UserResult {
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", JSONAPIUserData)
], UserResult.prototype, "data", void 0);
exports.UserResult = UserResult;
//# sourceMappingURL=user.api.entity.js.map