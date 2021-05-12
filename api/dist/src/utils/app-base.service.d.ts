import { BaseService, BaseServiceOptions, FetchSpecification } from 'nestjs-base-service';
import { Repository, SelectQueryBuilder } from 'typeorm';
export declare class PaginationMeta {
    totalPages: number;
    totalItems: number;
    size: number;
    page: number;
    constructor(paginationMeta: {
        totalPages: number;
        totalItems: number;
        size: number;
        page: number;
    });
}
export interface JSONAPISerializerAttributesConfig<Entity> {
    attributes: Array<keyof Entity>;
    keyForAttribute: string | (() => string) | 'lisp-case' | 'spinal-case' | 'kebab-case' | 'underscore_case' | 'snake_case' | 'camelCase' | 'CamelCase';
}
export declare type JSONAPISerializerConfig<Entity> = JSONAPISerializerAttributesConfig<Entity> & Record<string, unknown>;
export declare abstract class AppBaseService<Entity extends object, CreateModel, UpdateModel, Info> extends BaseService<Entity, CreateModel, UpdateModel, Info> {
    protected readonly repository: Repository<Entity>;
    protected alias: string;
    protected pluralAlias: string;
    protected serviceOptions: BaseServiceOptions;
    constructor(repository: Repository<Entity>, alias: string, pluralAlias: string, serviceOptions: BaseServiceOptions);
    abstract get serializerConfig(): JSONAPISerializerConfig<Entity>;
    serialize(entities: Partial<Entity> | (Partial<Entity> | undefined)[], paginationMeta?: PaginationMeta): Promise<any>;
    findAllPaginatedRaw(fetchSpecification?: FetchSpecification, info?: Info): Promise<{
        data: (Partial<Entity> | undefined)[];
        metadata: PaginationMeta | undefined;
    }>;
    findAllPaginated(fetchSpecification?: FetchSpecification, info?: Info): Promise<{
        data: (Partial<Entity> | undefined)[];
        metadata: PaginationMeta | undefined;
    }>;
    private _paginate;
    _processBaseFilters<Filters>(query: SelectQueryBuilder<Entity>, filters: Filters, filterKeys: any): SelectQueryBuilder<Entity>;
    _processBaseFilter(query: SelectQueryBuilder<Entity>, [filterKey, filterValues]: [string, unknown]): SelectQueryBuilder<Entity>;
}
export declare class JSONAPIEntityData {
    type: string;
    id: string;
    attributes: any;
}
export declare class EntityResult {
    data: JSONAPIEntityData;
}
