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
exports.OrganizationResultPlural = exports.OrganizationResultSingular = exports.JSONAPIOrganizationData = exports.Organization = exports.organizationResource = void 0;
const swagger_1 = require("@nestjs/swagger");
const project_api_entity_1 = require("../projects/project.api.entity");
const typeorm_1 = require("typeorm");
const time_user_entity_metadata_1 = require("../../types/time-user-entity-metadata");
exports.organizationResource = {
    className: 'Organization',
    name: {
        singular: 'organization',
        plural: 'organizations',
    },
    entitiesAllowedAsIncludes: ['projects'],
};
let Organization = class Organization extends time_user_entity_metadata_1.TimeUserEntityMetadata {
};
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Organization.prototype, "id", void 0);
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.Column('character varying'),
    __metadata("design:type", String)
], Organization.prototype, "name", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('character varying'),
    __metadata("design:type", String)
], Organization.prototype, "description", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('jsonb'),
    __metadata("design:type", Object)
], Organization.prototype, "metadata", void 0);
__decorate([
    swagger_1.ApiPropertyOptional({ type: () => project_api_entity_1.Project }),
    typeorm_1.OneToMany((_type) => project_api_entity_1.Project, (project) => project.organization),
    __metadata("design:type", Array)
], Organization.prototype, "projects", void 0);
Organization = __decorate([
    typeorm_1.Entity('organizations')
], Organization);
exports.Organization = Organization;
class JSONAPIOrganizationData {
    constructor() {
        this.type = 'organizations';
    }
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Object)
], JSONAPIOrganizationData.prototype, "type", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], JSONAPIOrganizationData.prototype, "id", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Organization)
], JSONAPIOrganizationData.prototype, "attributes", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    __metadata("design:type", Object)
], JSONAPIOrganizationData.prototype, "relationships", void 0);
exports.JSONAPIOrganizationData = JSONAPIOrganizationData;
class OrganizationResultSingular {
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", JSONAPIOrganizationData)
], OrganizationResultSingular.prototype, "data", void 0);
exports.OrganizationResultSingular = OrganizationResultSingular;
class OrganizationResultPlural {
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Array)
], OrganizationResultPlural.prototype, "data", void 0);
exports.OrganizationResultPlural = OrganizationResultPlural;
//# sourceMappingURL=organization.api.entity.js.map