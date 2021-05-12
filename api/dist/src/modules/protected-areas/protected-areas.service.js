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
exports.ProtectedAreasService = exports.protectedAreaResource = void 0;
const resource_interface_1 = require("../../types/resource.interface");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const info_dto_1 = require("../../dto/info.dto");
const typeorm_2 = require("typeorm");
const protected_area_geo_entity_1 = require("./protected-area.geo.entity");
const JSONAPISerializer = require("jsonapi-serializer");
const app_base_service_1 = require("../../utils/app-base.service");
const lodash_1 = require("lodash");
const admin_areas_service_1 = require("../admin-areas/admin-areas.service");
const class_validator_1 = require("class-validator");
const ormconfig_1 = require("../../ormconfig");
const config_utils_1 = require("../../utils/config.utils");
const protectedAreaFilterKeyNames = [
    'fullName',
    'wdpaId',
    'iucnCategory',
    'status',
    'designation',
    'countryId',
];
exports.protectedAreaResource = {
    className: 'ProtectedArea',
    name: {
        singular: 'protected_area',
        plural: 'protected_areas',
    },
};
class ProtectedAreaFilters {
}
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsBoolean(),
    __metadata("design:type", Boolean)
], ProtectedAreaFilters.prototype, "onlyCategories", void 0);
__decorate([
    class_validator_1.IsOptional(),
    class_validator_1.IsUUID(4),
    __metadata("design:type", String)
], ProtectedAreaFilters.prototype, "adminAreaId", void 0);
let ProtectedAreasService = class ProtectedAreasService extends app_base_service_1.AppBaseService {
    constructor(repository) {
        super(repository, 'protected_area', 'protected_areas', {
            logging: { muteAll: config_utils_1.AppConfig.get('logging.muteAll', false) },
        });
        this.repository = repository;
    }
    setFilters(query, filters, _info) {
        if (filters === null || filters === void 0 ? void 0 : filters.onlyCategories) {
            query.select(`${this.alias}.iucnCategory`, 'iucnCategory').distinct(true);
        }
        if (filters === null || filters === void 0 ? void 0 : filters.adminAreaId) {
            let whereClause;
            if (admin_areas_service_1.AdminAreasService.levelFromId(filters.adminAreaId) === 0) {
                whereClause = `gid_0 = '${filters.adminAreaId}' and gid_1 is null and gid_2 is null`;
            }
            else if (admin_areas_service_1.AdminAreasService.levelFromId(filters.adminAreaId) === 1) {
                whereClause = `gid_1 = '${filters.adminAreaId}' and gid_2 is null`;
            }
            else if (admin_areas_service_1.AdminAreasService.levelFromId(filters.adminAreaId) === 2) {
                whereClause = `gid_2 = '${filters.adminAreaId}'`;
            }
            else {
                throw new common_1.BadRequestException('An invalid administrative area id may have been provided.');
            }
            query.andWhere(`st_intersects(the_geom, (select the_geom from admin_regions a
        WHERE ${whereClause}))`);
        }
        query = this._processBaseFilters(query, filters, protectedAreaFilterKeyNames);
        return query;
    }
    get serializerConfig() {
        return {
            attributes: [
                'wdpaId',
                'fullName',
                'iucnCategory',
                'shapeLength',
                'shapeArea',
                'countryId',
                'status',
                'designation',
            ],
            keyForAttribute: 'camelCase',
        };
    }
    async importProtectedAreaShapefile(_file) {
        return new protected_area_geo_entity_1.ProtectedArea();
    }
    async listProtectedAreaCategories() {
        const results = await this.repository
            .createQueryBuilder(this.alias)
            .select(`${this.alias}.iucnCategory`, 'iucnCategory')
            .distinct(true)
            .getRawMany()
            .then((results) => results.map((i) => i.iucnCategory).filter((i) => !lodash_1.isNil(i)));
        return results;
    }
    async findAllProtectedAreaCategories(fetchSpecification) {
        const results = await this.findAllPaginatedRaw(Object.assign(Object.assign({}, fetchSpecification), { filter: Object.assign(Object.assign({}, fetchSpecification.filter), { onlyCategories: true }) })).then((results) => results.data
            .map((i) => ({
            iucnCategory: i === null || i === void 0 ? void 0 : i.iucnCategory,
        }))
            .filter((i) => !!i.iucnCategory));
        const serializer = new JSONAPISerializer.Serializer('iucn_protected_area_categories', {
            id: 'iucnCategory',
            attributes: ['iucnCategory'],
            keyForAttribute: 'camelCase',
        });
        return serializer.serialize(results);
    }
    async findAllWDPAProtectedAreasInPlanningAreaByIUCNCategory(planningAreaId, iucnCategories) {
        return await this.repository
            .createQueryBuilder(this.alias)
            .where(`${this.alias}.iucnCategory IN (:...iucnCategories)
        AND st_intersects(${this.alias}.the_geom,
        (select the_geom from admin_regions a WHERE a.id = :planningAreaId));`, { planningAreaId, iucnCategories })
            .getMany();
    }
};
ProtectedAreasService = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(protected_area_geo_entity_1.ProtectedArea, ormconfig_1.apiConnections.geoprocessingDB.name)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProtectedAreasService);
exports.ProtectedAreasService = ProtectedAreasService;
//# sourceMappingURL=protected-areas.service.js.map