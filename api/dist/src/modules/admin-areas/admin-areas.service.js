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
var AdminAreasService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAreasService = exports.AdminAreaLevel = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const info_dto_1 = require("../../dto/info.dto");
const typeorm_2 = require("typeorm");
const admin_area_geo_entity_1 = require("./admin-area.geo.entity");
const faker = require("faker");
const app_base_service_1 = require("../../utils/app-base.service");
const nestjs_base_service_1 = require("nestjs-base-service");
const lodash_1 = require("lodash");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const ormconfig_1 = require("../../ormconfig");
const config_utils_1 = require("../../utils/config.utils");
class AdminAreaLevel {
}
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsInt(),
    class_validator_1.Min(1),
    class_validator_1.Max(2),
    class_transformer_1.Transform((level) => parseInt(level)),
    __metadata("design:type", Number)
], AdminAreaLevel.prototype, "level", void 0);
exports.AdminAreaLevel = AdminAreaLevel;
let AdminAreasService = AdminAreasService_1 = class AdminAreasService extends app_base_service_1.AppBaseService {
    constructor(adminAreasRepository) {
        super(adminAreasRepository, 'admin_area', 'admin_areas', {
            logging: { muteAll: config_utils_1.AppConfig.get('logging.muteAll', false) },
        });
        this.adminAreasRepository = adminAreasRepository;
    }
    get serializerConfig() {
        return {
            transform: (item) => { var _a; return (Object.assign(Object.assign({}, item), { id: (_a = item.gid2) !== null && _a !== void 0 ? _a : item.gid1 })); },
            attributes: [
                'gid0',
                'name0',
                'gid1',
                'name1',
                'gid2',
                'name2',
                'theGeom',
            ],
            keyForAttribute: 'camelCase',
        };
    }
    async fakeFindOne(_id) {
        return this.serialize(Object.assign(Object.assign({}, new admin_area_geo_entity_1.AdminArea()), { name0: faker.address.country(), name1: faker.address.state() }));
    }
    setFilters(query, filters, _info) {
        if (filters === null || filters === void 0 ? void 0 : filters.countryId) {
            query.andWhere(`${this.alias}.gid0 = :countryId`, {
                countryId: filters.countryId,
            });
        }
        if (filters === null || filters === void 0 ? void 0 : filters.level2AreaByArea1Id) {
            query.andWhere(`${this.alias}.gid1 = :parentLevel1AreaId AND ${this.alias}.gid2 IS NOT NULL`, { parentLevel1AreaId: filters.level2AreaByArea1Id });
        }
        if ((filters === null || filters === void 0 ? void 0 : filters.level) === 2) {
            query.andWhere(`${this.alias}.gid2 IS NOT NULL`);
        }
        if ((filters === null || filters === void 0 ? void 0 : filters.level) === 1) {
            query.andWhere(`${this.alias}.gid1 IS NOT NULL AND ${this.alias}.gid2 IS NULL`);
        }
        return query;
    }
    async getByLevel1OrLevel2Id(areaId, fetchSpecification) {
        var _a;
        const query = this.repository.createQueryBuilder(this.alias);
        const queryWithFilters = nestjs_base_service_1.FetchUtils.processFetchSpecification(query, this.alias, fetchSpecification);
        if (this.isLevel1AreaId(areaId)) {
            query.where(`${this.alias}.gid1 = :areaId AND ${this.alias}.gid2 IS NULL`, { areaId });
        }
        if (this.isLevel2AreaId(areaId)) {
            query.where(`${this.alias}.gid2 = :areaId`, { areaId });
        }
        const results = await queryWithFilters.getOne();
        if (!results) {
            throw new common_1.NotFoundException(`No such administrative area (${areaId}).`);
        }
        const result = ((_a = fetchSpecification === null || fetchSpecification === void 0 ? void 0 : fetchSpecification.omitFields) === null || _a === void 0 ? void 0 : _a.length)
            ? lodash_1.omit(results, fetchSpecification.omitFields)
            : results;
        return result;
    }
    async getChildrenAdminAreas(parentAreaId, fetchSpecification) {
        if (this.isLevel1AreaId(parentAreaId)) {
            return this.findAllPaginated(Object.assign(Object.assign({}, fetchSpecification), { filter: Object.assign(Object.assign({}, fetchSpecification === null || fetchSpecification === void 0 ? void 0 : fetchSpecification.filter), { level2AreaByArea1Id: parentAreaId }) }));
        }
        else {
            throw new common_1.BadRequestException('Lookup of subdivisions is only supported for level 1 admin areas.');
        }
    }
    isLevel1AreaId(areaId) {
        return AdminAreasService_1.levelFromId(areaId) === 1;
    }
    isLevel2AreaId(areaId) {
        return AdminAreasService_1.levelFromId(areaId) === 2;
    }
    static levelFromId(areaId) {
        var _a, _b;
        return (_b = (_a = areaId.match(/\./g)) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
    }
};
AdminAreasService = AdminAreasService_1 = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(admin_area_geo_entity_1.AdminArea, ormconfig_1.apiConnections.geoprocessingDB.name)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AdminAreasService);
exports.AdminAreasService = AdminAreasService;
//# sourceMappingURL=admin-areas.service.js.map