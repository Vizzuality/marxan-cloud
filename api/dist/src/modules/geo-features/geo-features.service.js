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
exports.GeoFeaturesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const info_dto_1 = require("../../dto/info.dto");
const typeorm_2 = require("typeorm");
const geo_feature_geo_entity_1 = require("./geo-feature.geo.entity");
const faker = require("faker");
const app_base_service_1 = require("../../utils/app-base.service");
const geo_feature_api_entity_1 = require("./geo-feature.api.entity");
const project_api_entity_1 = require("../projects/project.api.entity");
const ormconfig_1 = require("../../ormconfig");
const config_utils_1 = require("../../utils/config.utils");
const geoFeatureFilterKeyNames = [
    'featureClassName',
    'alias',
    'description',
    'source',
    'propertyName',
    'tag',
    'projectId',
];
let GeoFeaturesService = class GeoFeaturesService extends app_base_service_1.AppBaseService {
    constructor(geoFeaturesGeometriesRepository, geoFeaturePropertySetsRepository, geoFeaturesRepository, projectRepository) {
        super(geoFeaturesRepository, geo_feature_geo_entity_1.geoFeatureResource.name.singular, geo_feature_geo_entity_1.geoFeatureResource.name.plural, {
            logging: { muteAll: config_utils_1.AppConfig.get('logging.muteAll', false) },
        });
        this.geoFeaturesGeometriesRepository = geoFeaturesGeometriesRepository;
        this.geoFeaturePropertySetsRepository = geoFeaturePropertySetsRepository;
        this.geoFeaturesRepository = geoFeaturesRepository;
        this.projectRepository = projectRepository;
    }
    get serializerConfig() {
        return {
            attributes: [
                'featureClassName',
                'alias',
                'description',
                'source',
                'propertyName',
                'intersection',
                'tag',
                'properties',
            ],
            keyForAttribute: 'camelCase',
        };
    }
    async fakeFindOne(_id) {
        return Object.assign(Object.assign({}, new geo_feature_api_entity_1.GeoFeature()), { id: faker.random.uuid(), featureClassName: faker.random.alphaNumeric(15), alias: faker.random.words(8), propertyName: faker.random.words(8), intersection: [...Array(4)].map((_i) => faker.random.uuid()), tag: faker.random.arrayElement(Object.values(geo_feature_api_entity_1.FeatureTags)), properties: [...Array(6)].map((_i) => this._fakeGeoFeatureProperty()) });
    }
    _fakeGeoFeatureProperty() {
        return {
            key: faker.random.word(),
            distinctValues: [...Array(8)].map((_i) => faker.random.words(6)),
        };
    }
    setFilters(query, filters, _info) {
        this._processBaseFilters(query, filters, geoFeatureFilterKeyNames);
        return query;
    }
    async extendFindAllQuery(query, fetchSpecification, info) {
        var _a, _b, _c, _d;
        let queryFilteredByPublicOrProjectSpecificFeatures;
        const projectId = (_b = (_a = info === null || info === void 0 ? void 0 : info.params) === null || _a === void 0 ? void 0 : _a.projectId) !== null && _b !== void 0 ? _b : (_c = fetchSpecification === null || fetchSpecification === void 0 ? void 0 : fetchSpecification.filter) === null || _c === void 0 ? void 0 : _c.projectId;
        if (projectId) {
            await this.projectRepository.findOneOrFail(projectId).catch((_error) => {
                throw new common_1.NotFoundException(`No project with id ${projectId} exists.`);
            });
            queryFilteredByPublicOrProjectSpecificFeatures = query.andWhere(`${this.alias}.projectId = :projectId OR ${this.alias}.projectId IS NULL`, { projectId });
        }
        else {
            queryFilteredByPublicOrProjectSpecificFeatures = query.andWhere(`${this.alias}.projectId IS NULL`);
        }
        if ((_d = info === null || info === void 0 ? void 0 : info.params) === null || _d === void 0 ? void 0 : _d.featureClassAndAliasFilter) {
            queryFilteredByPublicOrProjectSpecificFeatures.andWhere(`${this.alias}.alias ilike :featureClassAndAliasFilter OR ${this.alias}.featureClassName ilike :featureClassAndAliasFilter`, {
                featureClassAndAliasFilter: `%${info.params.featureClassAndAliasFilter}%`,
            });
        }
        return queryFilteredByPublicOrProjectSpecificFeatures;
    }
    async extendFindAllResults(entitiesAndCount, fetchSpecification, _info) {
        if (!(entitiesAndCount[1] > 0) ||
            ((fetchSpecification === null || fetchSpecification === void 0 ? void 0 : fetchSpecification.omitFields) &&
                fetchSpecification.omitFields.includes('properties')) ||
            ((fetchSpecification === null || fetchSpecification === void 0 ? void 0 : fetchSpecification.fields) &&
                !fetchSpecification.fields.includes('properties'))) {
            return entitiesAndCount;
        }
        const geoFeatureIds = entitiesAndCount[0].map((i) => i.id);
        const entitiesWithProperties = await this.geoFeaturePropertySetsRepository
            .createQueryBuilder('propertySets')
            .where(`propertySets.featureId IN (:...ids)`, { ids: geoFeatureIds })
            .getMany()
            .then((results) => {
            return entitiesAndCount[0].map((i) => {
                const propertySetForFeature = results.find((propertySet) => propertySet.featureId === i.id);
                return Object.assign(Object.assign({}, i), { properties: propertySetForFeature === null || propertySetForFeature === void 0 ? void 0 : propertySetForFeature.properties });
            });
        });
        return [entitiesWithProperties, entitiesAndCount[1]];
    }
    async extendGetByIdResult(entity, _fetchSpecification, _info) {
        return entity;
    }
};
GeoFeaturesService = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(geo_feature_geo_entity_1.GeoFeatureGeometry, ormconfig_1.apiConnections.geoprocessingDB.name)),
    __param(1, typeorm_1.InjectRepository(geo_feature_geo_entity_1.GeoFeaturePropertySet, ormconfig_1.apiConnections.geoprocessingDB.name)),
    __param(2, typeorm_1.InjectRepository(geo_feature_api_entity_1.GeoFeature)),
    __param(3, typeorm_1.InjectRepository(project_api_entity_1.Project)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], GeoFeaturesService);
exports.GeoFeaturesService = GeoFeaturesService;
//# sourceMappingURL=geo-features.service.js.map