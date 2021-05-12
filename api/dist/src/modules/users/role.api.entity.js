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
exports.Role = exports.Roles = void 0;
const class_validator_1 = require("class-validator");
const typeorm_1 = require("typeorm");
var Roles;
(function (Roles) {
    Roles["organization_owner"] = "organization_owner";
    Roles["project_owner"] = "project_owner";
    Roles["organization_admin"] = "organization_admin";
    Roles["project_admin"] = "project_admin";
    Roles["organization_user"] = "organization_user";
    Roles["project_user"] = "project_user";
})(Roles = exports.Roles || (exports.Roles = {}));
let Role = class Role {
};
__decorate([
    typeorm_1.PrimaryColumn({ type: 'varchar' }),
    class_validator_1.IsEnum(Object.values(Roles)),
    __metadata("design:type", String)
], Role.prototype, "name", void 0);
Role = __decorate([
    typeorm_1.Entity('roles')
], Role);
exports.Role = Role;
//# sourceMappingURL=role.api.entity.js.map