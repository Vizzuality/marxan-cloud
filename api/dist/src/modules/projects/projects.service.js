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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const info_dto_1 = require("../../dto/info.dto");
const typeorm_2 = require("typeorm");
const project_api_entity_1 = require("./project.api.entity");
const faker = require("faker");
const users_service_1 = require("../users/users.service");
const scenarios_service_1 = require("../scenarios/scenarios.service");
const planning_units_service_1 = require("../planning-units/planning-units.service");
const app_base_service_1 = require("../../utils/app-base.service");
const country_geo_entity_1 = require("../countries/country.geo.entity");
const admin_area_geo_entity_1 = require("../admin-areas/admin-area.geo.entity");
const admin_areas_service_1 = require("../admin-areas/admin-areas.service");
const countries_service_1 = require("../countries/countries.service");
const config_utils_1 = require("../../utils/config.utils");
const projectFilterKeyNames = [
    'name',
    'organizationId',
    'countryId',
    'adminAreaLevel1Id',
    'adminAreaLevel2Id',
];
let ProjectsService = class ProjectsService extends app_base_service_1.AppBaseService {
    constructor(repository, scenariosService, usersService, adminAreasService, countriesService, planningUnitsService) {
        super(repository, 'project', 'projects', {
            logging: { muteAll: config_utils_1.AppConfig.get('logging.muteAll', false) },
        });
        this.repository = repository;
        this.scenariosService = scenariosService;
        this.usersService = usersService;
        this.adminAreasService = adminAreasService;
        this.countriesService = countriesService;
        this.planningUnitsService = planningUnitsService;
    }
    get serializerConfig() {
        return {
            attributes: [
                'name',
                'description',
                'countryId',
                'adminAreaLevel1Id',
                'adminAreaLevel2Id',
                'planningUnitGridShape',
                'planningUnitAreakm2',
                'users',
                'scenarios',
                'createdAt',
                'lastModifiedAt',
            ],
            keyForAttribute: 'camelCase',
            users: {
                ref: 'id',
                attributes: ['fname', 'lname', 'email', 'projectRoles'],
                projectRoles: {
                    ref: 'name',
                    attributes: ['name'],
                },
            },
            scenarios: {
                ref: 'id',
                attributes: [
                    'name',
                    'description',
                    'type',
                    'wdpaFilter',
                    'wdpaThreshold',
                    'adminRegionId',
                    'numberOfRuns',
                    'boundaryLengthModifier',
                    'metadata',
                    'status',
                    'createdAt',
                    'lastModifiedAt',
                ],
            },
        };
    }
    async importLegacyProject(_file) {
        return new project_api_entity_1.Project();
    }
    async fakeFindOne(_id) {
        const project = Object.assign(Object.assign({}, new project_api_entity_1.Project()), { id: faker.random.uuid(), name: faker.lorem.words(5), description: faker.lorem.sentence(), users: await Promise.all(Array.from({ length: 10 }).map(async (_userId) => await this.usersService.fakeFindOne(faker.random.uuid()))), attributes: await Promise.all(Array.from({ length: 5 }).map(async (_scenarioId) => await this.scenariosService.fakeFindOne(faker.random.uuid()))) });
        return project;
    }
    setFilters(query, filters, _info) {
        this._processBaseFilters(query, filters, projectFilterKeyNames);
        return query;
    }
    async setDataCreate(create, info) {
        var _a;
        const project = await super.setDataCreate(create, info);
        project.createdBy = (_a = info === null || info === void 0 ? void 0 : info.authenticatedUser) === null || _a === void 0 ? void 0 : _a.id;
        return project;
    }
    async getPlanningArea(project) {
        const planningArea = project.planningAreaGeometryId
            ?
                new admin_area_geo_entity_1.AdminArea()
            : project.adminAreaLevel2Id
                ? await this.adminAreasService.getByLevel1OrLevel2Id(project.adminAreaLevel2Id)
                : project.adminAreaLevel1Id
                    ? await this.adminAreasService.getByLevel1OrLevel2Id(project.adminAreaLevel1Id)
                    : project.countryId
                        ? await this.countriesService.getById(project.countryId)
                        : undefined;
        return planningArea;
    }
    async actionAfterCreate(model, createModel, _info) {
        if (createModel.planningUnitAreakm2 &&
            createModel.planningUnitGridShape &&
            (createModel.countryId ||
                createModel.adminAreaLevel1Id ||
                createModel.adminAreaLevel2Id ||
                createModel.extent)) {
            this.logger.debug('creating planning unit job ');
            return this.planningUnitsService.create(createModel);
        }
    }
    async actionAfterUpdate(model, createModel, _info) {
        if (createModel.planningUnitAreakm2 &&
            createModel.planningUnitGridShape &&
            (createModel.countryId ||
                createModel.adminAreaLevel1Id ||
                createModel.adminAreaLevel2Id ||
                createModel.extent)) {
            this.logger.debug('creating planning unit job ');
            return this.planningUnitsService.create(createModel);
        }
    }
};
ProjectsService = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(project_api_entity_1.Project)),
    __param(1, common_1.Inject(common_1.forwardRef(() => scenarios_service_1.ScenariosService))),
    __param(2, common_1.Inject(users_service_1.UsersService)),
    __param(3, common_1.Inject(admin_areas_service_1.AdminAreasService)),
    __param(4, common_1.Inject(countries_service_1.CountriesService)),
    __param(5, common_1.Inject(planning_units_service_1.PlanningUnitsService)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        scenarios_service_1.ScenariosService,
        users_service_1.UsersService,
        admin_areas_service_1.AdminAreasService,
        countries_service_1.CountriesService,
        planning_units_service_1.PlanningUnitsService])
], ProjectsService);
exports.ProjectsService = ProjectsService;
//# sourceMappingURL=projects.service.js.map