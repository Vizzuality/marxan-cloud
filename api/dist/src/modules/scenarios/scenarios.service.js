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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScenariosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const info_dto_1 = require("../../dto/info.dto");
const typeorm_2 = require("typeorm");
const scenario_api_entity_1 = require("./scenario.api.entity");
const faker = require("faker");
const users_service_1 = require("../users/users.service");
const app_base_service_1 = require("../../utils/app-base.service");
const project_api_entity_1 = require("../projects/project.api.entity");
const protected_areas_service_1 = require("../protected-areas/protected-areas.service");
const projects_service_1 = require("../projects/projects.service");
const lodash_1 = require("lodash");
const config_utils_1 = require("../../utils/config.utils");
const wdpa_area_calculation_service_1 = require("./wdpa-area-calculation.service");
const scenarioFilterKeyNames = ['name', 'type', 'projectId', 'status'];
let ScenariosService = class ScenariosService extends app_base_service_1.AppBaseService {
    constructor(repository, projectRepository, usersService, protectedAreasService, projectsService, wdpaCalculationsDetector) {
        super(repository, 'scenario', 'scenarios', {
            logging: { muteAll: config_utils_1.AppConfig.get('logging.muteAll', false) },
        });
        this.repository = repository;
        this.projectRepository = projectRepository;
        this.usersService = usersService;
        this.protectedAreasService = protectedAreasService;
        this.projectsService = projectsService;
        this.wdpaCalculationsDetector = wdpaCalculationsDetector;
    }
    async actionAfterCreate(model, createModel, _) {
        if (this.wdpaCalculationsDetector.shouldTrigger(model, createModel)) {
        }
    }
    async actionAfterUpdate(model, updateModel, _) {
        if (this.wdpaCalculationsDetector.shouldTrigger(model, updateModel)) {
        }
    }
    get serializerConfig() {
        return {
            attributes: [
                'name',
                'description',
                'type',
                'protectedAreaFilterByIds',
                'wdpaIucnCategories',
                'wdpaThreshold',
                'numberOfRuns',
                'boundaryLengthModifier',
                'metadata',
                'status',
                'projectId',
                'project',
                'users',
                'createdAt',
                'createdByUser',
                'lastModifiedAt',
            ],
            keyForAttribute: 'camelCase',
            project: {
                ref: 'id',
                attributes: [
                    'name',
                    'description',
                    'countryId',
                    'adminAreaLevel1Id',
                    'adminAreaLevel2Id',
                    'planningUnitGridShape',
                    'planningUnitAreakm2',
                    'createdAt',
                    'lastModifiedAt',
                ],
            },
            users: {
                ref: 'id',
                attributes: ['fname', 'lname', 'email'],
                projectRoles: {
                    ref: 'name',
                    attributes: ['name'],
                },
            },
        };
    }
    async importLegacyScenario(_file) {
        return new scenario_api_entity_1.Scenario();
    }
    async fakeFindOne(_id) {
        const scenario = Object.assign(Object.assign({}, new scenario_api_entity_1.Scenario()), { id: faker.random.uuid(), name: faker.lorem.words(5), description: faker.lorem.sentence(), type: scenario_api_entity_1.ScenarioType.marxan, extent: {}, wdpaFilter: {}, wdpaThreshold: faker.random.number(100), adminRegionId: faker.random.uuid(), numberOfRuns: faker.random.number(100), boundaryLengthModifier: faker.random.number(100), metadata: {}, status: scenario_api_entity_1.JobStatus.created, users: await Promise.all(Array.from({ length: 10 }).map(async (_userId) => await this.usersService.fakeFindOne(faker.random.uuid()))) });
        return scenario;
    }
    setFilters(query, filters, _info) {
        query = this._processBaseFilters(query, filters, scenarioFilterKeyNames);
        return query;
    }
    async setDataCreate(create, info) {
        var _a;
        const model = await super.setDataCreate(create, info);
        if (create.wdpaIucnCategories || create.customProtectedAreaIds) {
            const wdpaAreaIds = await this.getWDPAAreasWithinProjectByIUCNCategory(create);
            model.protectedAreaFilterByIds = [
                ...new Set(lodash_1.concat(wdpaAreaIds, create.customProtectedAreaIds).filter((i) => !!i)),
            ];
        }
        model.createdBy = (_a = info === null || info === void 0 ? void 0 : info.authenticatedUser) === null || _a === void 0 ? void 0 : _a.id;
        return model;
    }
    async setDataUpdate(model, update, info) {
        model = await super.setDataUpdate(model, update, info);
        if (update.wdpaIucnCategories || update.customProtectedAreaIds) {
            const wdpaAreaIds = await this.getWDPAAreasWithinProjectByIUCNCategory(update);
            model.protectedAreaFilterByIds = [
                ...new Set(lodash_1.concat(wdpaAreaIds, update.customProtectedAreaIds).filter((i) => !!i)),
            ];
        }
        return model;
    }
    async getWDPAAreasWithinProjectByIUCNCategory({ projectId, wdpaIucnCategories, }, _info) {
        if (!wdpaIucnCategories) {
            return;
        }
        const parentProject = await this.projectRepository.findOneOrFail(projectId);
        const planningAreaId = await this.projectsService
            .getPlanningArea(parentProject)
            .then((r) => r === null || r === void 0 ? void 0 : r.id);
        const wdpaAreaIdsWithinPlanningArea = planningAreaId
            ? await this.protectedAreasService
                .findAllWDPAProtectedAreasInPlanningAreaByIUCNCategory(planningAreaId, wdpaIucnCategories)
                .then((r) => r.map((i) => i.id))
            : undefined;
        return wdpaAreaIdsWithinPlanningArea;
    }
};
ScenariosService = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(scenario_api_entity_1.Scenario)),
    __param(1, typeorm_1.InjectRepository(project_api_entity_1.Project)),
    __param(2, common_1.Inject(users_service_1.UsersService)),
    __param(3, common_1.Inject(protected_areas_service_1.ProtectedAreasService)),
    __param(4, common_1.Inject(common_1.forwardRef(() => projects_service_1.ProjectsService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService,
        protected_areas_service_1.ProtectedAreasService,
        projects_service_1.ProjectsService,
        wdpa_area_calculation_service_1.WdpaAreaCalculationService])
], ScenariosService);
exports.ScenariosService = ScenariosService;
//# sourceMappingURL=scenarios.service.js.map