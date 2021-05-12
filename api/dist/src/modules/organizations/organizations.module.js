"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const organizations_controller_1 = require("./organizations.controller");
const organization_api_entity_1 = require("./organization.api.entity");
const organizations_service_1 = require("./organizations.service");
const users_module_1 = require("../users/users.module");
let OrganizationsModule = class OrganizationsModule {
};
OrganizationsModule = __decorate([
    common_1.Module({
        imports: [typeorm_1.TypeOrmModule.forFeature([organization_api_entity_1.Organization]), users_module_1.UsersModule],
        providers: [organizations_service_1.OrganizationsService],
        controllers: [organizations_controller_1.OrganizationsController],
        exports: [organizations_service_1.OrganizationsService],
    })
], OrganizationsModule);
exports.OrganizationsModule = OrganizationsModule;
//# sourceMappingURL=organizations.module.js.map