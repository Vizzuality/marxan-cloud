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
exports.OrganizationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const info_dto_1 = require("../../dto/info.dto");
const typeorm_2 = require("typeorm");
const organization_api_entity_1 = require("./organization.api.entity");
const faker = require("faker");
const users_service_1 = require("../users/users.service");
const app_base_service_1 = require("../../utils/app-base.service");
const config_utils_1 = require("../../utils/config.utils");
const organizationFilterKeyNames = ['name'];
let OrganizationsService = class OrganizationsService extends app_base_service_1.AppBaseService {
    constructor(repository, usersService) {
        super(repository, 'organization', 'organizations', {
            logging: { muteAll: config_utils_1.AppConfig.get('logging.muteAll', false) },
        });
        this.repository = repository;
        this.usersService = usersService;
    }
    get serializerConfig() {
        return {
            attributes: ['name', 'description', 'metadata', 'projects'],
            keyForAttribute: 'camelCase',
            projects: {
                ref: 'id',
                attributes: ['name', 'description', 'metadata', 'scenarios'],
                scenarios: {
                    ref: 'id',
                    attributes: [
                        'name',
                        'description',
                        'type',
                        'wdpaFilter',
                        'wdpaThreshold',
                        'numberOfRuns',
                        'boundaryLengthModifier',
                        'metadata',
                        'status',
                        'users',
                        'createdAt',
                        'lastModifiedAt',
                    ],
                },
            },
        };
    }
    async fakeFindOne(_id) {
        const organization = Object.assign(Object.assign({}, new organization_api_entity_1.Organization()), { id: faker.random.uuid(), name: faker.lorem.words(5), description: faker.lorem.sentence() });
        return organization;
    }
    setFilters(query, filters, _info) {
        this._processBaseFilters(query, filters, organizationFilterKeyNames);
        return query;
    }
    async setDataCreate(create, info) {
        var _a;
        const organization = await super.setDataCreate(create, info);
        organization.createdBy = (_a = info === null || info === void 0 ? void 0 : info.authenticatedUser) === null || _a === void 0 ? void 0 : _a.id;
        return organization;
    }
    async remove(id) {
        await this.repository.delete(id);
    }
};
OrganizationsService = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(organization_api_entity_1.Organization)),
    __param(1, common_1.Inject(users_service_1.UsersService)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService])
], OrganizationsService);
exports.OrganizationsService = OrganizationsService;
//# sourceMappingURL=organizations.service.js.map