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
var Scenario_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScenarioResult = exports.JSONAPIScenarioData = exports.Scenario = exports.JobStatus = exports.ScenarioType = exports.scenarioResource = void 0;
const swagger_1 = require("@nestjs/swagger");
const project_api_entity_1 = require("../projects/project.api.entity");
const typeorm_1 = require("typeorm");
const user_api_entity_1 = require("../users/user.api.entity");
const class_validator_1 = require("class-validator");
const time_user_entity_metadata_1 = require("../../types/time-user-entity-metadata");
exports.scenarioResource = {
    className: 'Scenario',
    name: {
        singular: 'scenario',
        plural: 'scenarios',
    },
    entitiesAllowedAsIncludes: ['project', 'users'],
};
var ScenarioType;
(function (ScenarioType) {
    ScenarioType["marxan"] = "marxan";
    ScenarioType["marxanWithZones"] = "marxan-with-zones";
})(ScenarioType = exports.ScenarioType || (exports.ScenarioType = {}));
var JobStatus;
(function (JobStatus) {
    JobStatus["created"] = "created";
    JobStatus["running"] = "running";
    JobStatus["done"] = "done";
    JobStatus["failure"] = "failure";
})(JobStatus = exports.JobStatus || (exports.JobStatus = {}));
let Scenario = Scenario_1 = class Scenario extends time_user_entity_metadata_1.TimeUserEntityMetadata {
};
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], Scenario.prototype, "id", void 0);
__decorate([
    swagger_1.ApiProperty(),
    typeorm_1.Column('character varying'),
    __metadata("design:type", String)
], Scenario.prototype, "name", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('character varying'),
    __metadata("design:type", String)
], Scenario.prototype, "description", void 0);
__decorate([
    swagger_1.ApiProperty({ enum: ScenarioType, enumName: 'ScenarioType' }),
    typeorm_1.Column('enum'),
    __metadata("design:type", String)
], Scenario.prototype, "type", void 0);
__decorate([
    swagger_1.ApiProperty({ type: () => project_api_entity_1.Project }),
    typeorm_1.ManyToOne((_type) => project_api_entity_1.Project, (project) => project.scenarios),
    typeorm_1.JoinColumn({
        name: 'project_id',
        referencedColumnName: 'id',
    }),
    __metadata("design:type", project_api_entity_1.Project)
], Scenario.prototype, "project", void 0);
__decorate([
    typeorm_1.Column('uuid', { name: 'project_id' }),
    __metadata("design:type", String)
], Scenario.prototype, "projectId", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('varchar', { name: 'wdpa_iucn_categories', array: true }),
    __metadata("design:type", Array)
], Scenario.prototype, "wdpaIucnCategories", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    class_validator_1.IsOptional(),
    typeorm_1.Column('jsonb', { name: 'protected_area_filter_by_ids' }),
    __metadata("design:type", Array)
], Scenario.prototype, "protectedAreaFilterByIds", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('integer', { name: 'wdpa_threshold' }),
    class_validator_1.IsOptional(),
    __metadata("design:type", Object)
], Scenario.prototype, "wdpaThreshold", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('integer', { name: 'number_of_runs' }),
    __metadata("design:type", Number)
], Scenario.prototype, "numberOfRuns", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('double precision', { name: 'blm' }),
    __metadata("design:type", Number)
], Scenario.prototype, "boundaryLengthModifier", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.Column('jsonb'),
    __metadata("design:type", Object)
], Scenario.prototype, "metadata", void 0);
__decorate([
    swagger_1.ApiProperty({ enum: JobStatus, enumName: 'JobStatus' }),
    typeorm_1.Column('enum'),
    __metadata("design:type", String)
], Scenario.prototype, "status", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    class_validator_1.IsOptional(),
    typeorm_1.Column('uuid', { name: 'parent_id' }),
    __metadata("design:type", String)
], Scenario.prototype, "parentScenarioId", void 0);
__decorate([
    swagger_1.ApiPropertyOptional(),
    typeorm_1.OneToOne((_type) => Scenario_1),
    typeorm_1.JoinColumn({ name: 'parent_id', referencedColumnName: 'id' }),
    __metadata("design:type", Scenario)
], Scenario.prototype, "parentScenario", void 0);
__decorate([
    swagger_1.ApiProperty({
        type: () => user_api_entity_1.User,
        isArray: true,
    }),
    class_validator_1.IsArray(),
    typeorm_1.ManyToMany((_type) => user_api_entity_1.User, (user) => user.scenarios, { eager: true }),
    __metadata("design:type", Array)
], Scenario.prototype, "users", void 0);
Scenario = Scenario_1 = __decorate([
    typeorm_1.Entity('scenarios')
], Scenario);
exports.Scenario = Scenario;
class JSONAPIScenarioData {
    constructor() {
        this.type = 'scenarios';
    }
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Object)
], JSONAPIScenarioData.prototype, "type", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], JSONAPIScenarioData.prototype, "id", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Scenario)
], JSONAPIScenarioData.prototype, "attributes", void 0);
exports.JSONAPIScenarioData = JSONAPIScenarioData;
class ScenarioResult {
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", JSONAPIScenarioData)
], ScenarioResult.prototype, "data", void 0);
exports.ScenarioResult = ScenarioResult;
//# sourceMappingURL=scenario.api.entity.js.map