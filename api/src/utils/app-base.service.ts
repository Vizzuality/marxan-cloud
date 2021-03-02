import {
  BaseService,
  FetchSpecification,
  FetchUtils,
} from 'nestjs-base-service';

import JSONAPISerializer = require('jsonapi-serializer');
import { Repository } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { DEFAULT_PAGINATION } from 'nestjs-base-service';
import { omit } from 'lodash';

export class PaginationMeta {
  totalPages: number;

  totalItems: number;

  size: number;

  page: number;

  constructor(paginationMeta: {
    totalPages: number;
    totalItems: number;
    size: number;
    page: number;
  }) {
    this.totalItems = paginationMeta.totalItems;
    this.totalPages = paginationMeta.totalPages;
    this.size = paginationMeta.size;
    this.page = paginationMeta.page;
  }
}

/**
 * The part of the configuration object for jsonapi-serializer concerned with
 * serializable properties.
 *
 * We handle this separately (while leaving the rest of the config object
 * loosely typed as Record<string, unknown>) so that we can start to
 * incrementally make typing stricter where this can be more useful to catch
 * accidental mistakes (configuring the entity's own serializable properties).
 */
export interface JSONAPISerializerAttributesConfig<Entity> {
  attributes: Array<keyof Entity>;
  /**
   * Approximate typing from jsonapi-serializer's documentation
   * (https://github.com/SeyZ/jsonapi-serializer#available-serialization-option-opts-argument),
   * but in practice we should only use `camelCase` in this project.
   */
  keyForAttribute:
    | string
    | (() => string)
    | 'lisp-case'
    | 'spinal-case'
    | 'kebab-case'
    | 'underscore_case'
    | 'snake_case'
    | 'camelCase'
    | 'CamelCase';
}

export type JSONAPISerializerConfig<
  Entity
> = JSONAPISerializerAttributesConfig<Entity> & Record<string, unknown>;

export abstract class AppBaseService<
  Entity extends object,
  CreateModel,
  UpdateModel,
  Info
> extends BaseService<Entity, CreateModel, UpdateModel, Info> {
  constructor(
    protected readonly repository: Repository<Entity>,
    protected alias: string = 'base',
    protected pluralAlias: string = 'plural base',
  ) {
    super(repository, alias);
  }

  /**
   * @debt Add proper typing.
   */
  abstract get serializerConfig(): JSONAPISerializerConfig<Entity>;

  async findAll(
    fetchSpecification: FetchSpecification,
    info?: Info,
    filters: any = null,
  ): Promise<[Partial<Entity>[], number]> {
    Logger.debug(`Finding all ${this.repository.metadata.name}`);
    let query = this.repository.createQueryBuilder(this.alias);
    const _i = { ...info, fetchSpecification };
    query = this.setFilters(query, filters, info);
    query = FetchUtils.processFetchSpecification(
      query,
      this.alias,
      fetchSpecification,
    );
    Logger.debug(query.getQueryAndParameters());
    const entitiesAndCount = await query.getManyAndCount();

    /**
     * Process `omitFields` - if a user specified any fields in this list,
     * remove matching props from the items in the result set.
     *
     * @debt I don't think we should need a non-null assertion in the call to
     * `omit()` because if we get to the first branch of the ternary operator
     * `fetchSpecification.omitFields` must be non-null, but TS does know
     * better.
     */
    const entities = fetchSpecification?.omitFields?.length
      ? entitiesAndCount[0].map((e) => omit(e, fetchSpecification.omitFields!))
      : entitiesAndCount[0];

    return [entities, entitiesAndCount[1]];
  }

  async getSerializedData(
    data: Partial<Entity> | (Partial<Entity> | undefined)[],
    meta?: PaginationMeta,
  ) {
    const serializer = new JSONAPISerializer.Serializer(this.pluralAlias, {
      ...this.serializerConfig,
      meta,
    });

    return serializer.serialize(data);
  }

  async serialize(
    entities: Partial<Entity> | (Partial<Entity> | undefined)[],
    paginationMeta?: PaginationMeta,
  ): Promise<any> {
    return this.getSerializedData(entities, paginationMeta);
  }

  async findAllPaginated(
    fetchSpecification: FetchSpecification,
    info?: Info,
    filters?: Record<string, unknown>,
  ): Promise<{
    data: (Partial<Entity> | undefined)[];
    metadata: PaginationMeta;
  }> {
    const entitiesAndCount = await this.findAll(
      fetchSpecification,
      info,
      filters,
    );
    const totalItems = entitiesAndCount[1];
    const entities = entitiesAndCount[0];
    const pageSize =
      fetchSpecification?.pageSize ?? DEFAULT_PAGINATION.pageSize;
    const meta = new PaginationMeta({
      totalPages: Math.ceil(totalItems / pageSize),
      totalItems,
      size: pageSize,
      page: fetchSpecification?.pageNumber ?? DEFAULT_PAGINATION.pageNumber,
    });

    return { data: entities, metadata: meta };
  }
}

export class JSONAPIEntityData {
  @ApiProperty()
  type = 'base';

  @ApiProperty()
  id: string;

  @ApiProperty()
  attributes: any;
}

export class EntityResult {
  @ApiProperty()
  data: JSONAPIEntityData;
}
