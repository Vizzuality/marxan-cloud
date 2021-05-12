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
exports.ProjectResultSingular = exports.ProjectResultPlural = exports.JSONAPIProjectData = exports.Project = exports.PlanningUnitGridShape = exports.projectResource = void 0;
const swagger_1 = require("@nestjs/swagger");
const user_api_entity_1 = require("../users/user.api.entity");
const scenario_api_entity_1 = require("../scenarios/scenario.api.entity");
const typeorm_1 = require("typeorm");
const organization_api_entity_1 = require("../organizations/organization.api.entity");
const time_user_entity_metadata_1 = require("../../types/time-user-entity-metadata");
exports.projectResource = {
    className: 'Project',
    name: {
        singular: 'project',
        plural: 'projects',
    },
    entitiesAllowedAsIncludes: ['scenarios', 'users'],
};
var PlanningUnitGridShape;
(function (PlanningUnitGridShape) {
    PlanningUnitGridShape["square"] = "square";
    PlanningUnitGridShape["hexagon"] = "hexagon";
    PlanningUnitGridShape["fromShapefile"] = "from_shapefile";
})(PlanningUnitGridShape = exports.PlanningUnitGridShape || (exports.PlanningUnitGridShape = {}));
let Project = class Project extends time_user_entity_metadata_1.TimeUserEntityMetadata {
};
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Project.prototype, "id", void 0);
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.Column('character varying'),
    __metadata("design:type", String)
], Project.prototype, "name", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('character varying'),
    __metadata("design:type", String)
], Project.prototype, "description", void 0);
__decorate([
    swagger_1.ApiProperty({ type: () => organization_api_entity_1.Organization }),
    typeorm_1.ManyToOne((_type) => organization_api_entity_1.Organization, (organization) => organization.projects),
    typeorm_1.JoinColumn({
        name: 'organization_id',
        referencedColumnName: 'id',
    }),
    __metadata("design:type", organization_api_entity_1.Organization)
], Project.prototype, "organization", void 0);
__decorate([
    typeorm_1.Column('uuid', { name: 'organization_id' }),
    __metadata("design:type", String)
], Project.prototype, "organizationId", void 0);
__decorate([
    typeorm_1.Column('character varying', { name: 'country_id' }),
    __metadata("design:type", String)
], Project.prototype, "countryId", void 0);
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.Column('character varying', { name: 'admin_area_l1_id' }),
    __metadata("design:type", String)
], Project.prototype, "adminAreaLevel1Id", void 0);
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.Column('character varying', { name: 'admin_area_l2_id' }),
    __metadata("design:type", String)
], Project.prototype, "adminAreaLevel2Id", void 0);
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.Column('enum', { name: 'planning_unit_grid_shape' }),
    __metadata("design:type", String)
], Project.prototype, "planningUnitGridShape", void 0);
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.Column('float', { name: 'planning_unit_area_km2' }),
    __metadata("design:type", Number)
], Project.prototype, "planningUnitAreakm2", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('geometry'),
    __metadata("design:type", Object)
], Project.prototype, "extent", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('jsonb'),
    __metadata("design:type", Object)
], Project.prototype, "metadata", void 0);
__decorate([
    swagger_1.ApiPropertyOptional({ type: () => scenario_api_entity_1.Scenario }),
    typeorm_1.OneToMany((_type) => scenario_api_entity_1.Scenario, (scenario) => scenario.project),
    __metadata("design:type", Array)
], Project.prototype, "scenarios", void 0);
__decorate([
    swagger_1.ApiProperty({
        type: () => user_api_entity_1.User,
        isArray: true,
    }),
    typeorm_1.ManyToMany((_type) => user_api_entity_1.User, (user) => user.projects, { eager: true }),
    __metadata("design:type", Array)
], Project.prototype, "users", void 0);
Project = __decorate([
    typeorm_1.Entity('projects')
], Project);
exports.Project = Project;
class JSONAPIProjectData {
    constructor() {
        this.type = 'projects';
    }
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Object)
], JSONAPIProjectData.prototype, "type", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], JSONAPIProjectData.prototype, "id", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Project)
], JSONAPIProjectData.prototype, "attributes", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    __metadata("design:type", Object)
], JSONAPIProjectData.prototype, "relationships", void 0);
exports.JSONAPIProjectData = JSONAPIProjectData;
class ProjectResultPlural {
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Array)
], ProjectResultPlural.prototype, "data", void 0);
exports.ProjectResultPlural = ProjectResultPlural;
class ProjectResultSingular {
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", JSONAPIProjectData)
], ProjectResultSingular.prototype, "data", void 0);
exports.ProjectResultSingular = ProjectResultSingular;
//# sourceMappingURL=project.api.entity.js.map