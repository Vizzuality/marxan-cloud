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
exports.EntityResult = exports.JSONAPIEntityData = exports.AppBaseService = exports.PaginationMeta = void 0;
const nestjs_base_service_1 = require("nestjs-base-service");
const JSONAPISerializer = require("jsonapi-serializer");
const swagger_1 = require("@nestjs/swagger");
const nestjs_base_service_2 = require("nestjs-base-service");
const lodash_1 = require("lodash");
class PaginationMeta {
    constructor(paginationMeta) {
        this.totalItems = paginationMeta.totalItems;
        this.totalPages = paginationMeta.totalPages;
        this.size = paginationMeta.size;
        this.page = paginationMeta.page;
    }
}
exports.PaginationMeta = PaginationMeta;
class AppBaseService extends nestjs_base_service_1.BaseService {
    constructor(repository, alias = 'base_entity', pluralAlias = 'base_entities', serviceOptions) {
        super(repository, alias, serviceOptions);
        this.repository = repository;
        this.alias = alias;
        this.pluralAlias = pluralAlias;
        this.serviceOptions = serviceOptions;
    }
    async serialize(entities, paginationMeta) {
        const serializer = new JSONAPISerializer.Serializer(this.pluralAlias, Object.assign(Object.assign({}, this.serializerConfig), { meta: paginationMeta }));
        return serializer.serialize(entities);
    }
    async findAllPaginatedRaw(fetchSpecification, info) {
        const entitiesAndCount = await this.findAllRaw(fetchSpecification, info);
        return this._paginate(entitiesAndCount, fetchSpecification);
    }
    async findAllPaginated(fetchSpecification, info) {
        const entitiesAndCount = await this.findAll(fetchSpecification, info);
        return this._paginate(entitiesAndCount, fetchSpecification);
    }
    _paginate(entitiesAndCount, fetchSpecification) {
        var _a, _b, _c, _d;
        const totalItems = entitiesAndCount[1];
        const entities = entitiesAndCount[0];
        const pageSize = (_b = (_a = fetchSpecification === null || fetchSpecification === void 0 ? void 0 : fetchSpecification.pageSize) !== null && _a !== void 0 ? _a : nestjs_base_service_2.DEFAULT_PAGINATION.pageSize) !== null && _b !== void 0 ? _b : 25;
        const page = (_d = (_c = fetchSpecification === null || fetchSpecification === void 0 ? void 0 : fetchSpecification.pageNumber) !== null && _c !== void 0 ? _c : nestjs_base_service_2.DEFAULT_PAGINATION.pageNumber) !== null && _d !== void 0 ? _d : 1;
        const disablePagination = fetchSpecification === null || fetchSpecification === void 0 ? void 0 : fetchSpecification.disablePagination;
        const meta = disablePagination
            ? undefined
            : new PaginationMeta({
                totalPages: Math.ceil(totalItems / pageSize),
                totalItems,
                size: pageSize,
                page,
            });
        return { data: entities, metadata: meta };
    }
    _processBaseFilters(query, filters, filterKeys) {
        if (filters) {
            Object.entries(filters)
                .filter((i) => Array.from(filterKeys).includes(i[0]))
                .forEach((i) => this._processBaseFilter(query, i));
        }
        return query;
    }
    _processBaseFilter(query, [filterKey, filterValues]) {
        if (Array.isArray(filterValues) && filterValues.length) {
            query.andWhere(`${this.alias}.${filterKey} IN (:...${filterKey}Values)`, {
                [`${filterKey}Values`]: lodash_1.castArray(filterValues),
            });
        }
        return query;
    }
}
exports.AppBaseService = AppBaseService;
class JSONAPIEntityData {
    constructor() {
        this.type = 'base';
    }
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Object)
], JSONAPIEntityData.prototype, "type", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", String)
], JSONAPIEntityData.prototype, "id", void 0);
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", Object)
], JSONAPIEntityData.prototype, "attributes", void 0);
exports.JSONAPIEntityData = JSONAPIEntityData;
class EntityResult {
}
__decorate([
    swagger_1.ApiProperty(),
    __metadata("design:type", JSONAPIEntityData)
], EntityResult.prototype, "data", void 0);
exports.EntityResult = EntityResult;
//# sourceMappingURL=app-base.service.js.map