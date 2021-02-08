import {
  BaseService,
  FetchSpecification,
  PaginationUtils,
} from 'nestjs-base-service';

import JSONAPISerializer = require('jsonapi-serializer');
import { Repository } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { DEFAULT_PAGINATION } from 'nestjs-base-service';

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

export abstract class AppBaseService<
  Entity,
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
  abstract get serializerConfig(): Record<string, unknown>;

  findAll(
    fetchSpecification: FetchSpecification,
    info?: Info,
    filters: any = null,
  ): Promise<[Entity[], number]> {
    Logger.debug(`Finding all ${this.repository.metadata.name}`);
    let query = this.repository.createQueryBuilder(this.alias);
    const _i = { ...info, fetchSpecification };
    query = this.setFilters(query, filters, info);
    query = PaginationUtils.addPagination(
      query,
      this.alias,
      fetchSpecification,
    );
    Logger.debug(query.getQueryAndParameters());
    return query.getManyAndCount();
  }

  async getSerializedData(data: Entity[], meta?: PaginationMeta) {
    const serializer = new JSONAPISerializer.Serializer(this.pluralAlias, {
      ...this.serializerConfig,
      meta,
    });

    return serializer.serialize(data);
  }

  async serialize(
    entities: Entity[],
    paginationMeta?: PaginationMeta,
  ): Promise<any> {
    return this.getSerializedData(entities, paginationMeta);
  }

  async findAllPaginated(
    pagination: FetchSpecification,
  ): Promise<{ data: Entity[]; metadata: PaginationMeta }> {
    const entitiesAndCount = await this.findAll(pagination);
    const totalItems = entitiesAndCount[1];
    const entities = entitiesAndCount[0];
    const pageSize = pagination?.pageSize ?? DEFAULT_PAGINATION.pageSize!;
    const meta = new PaginationMeta({
      totalPages: Math.ceil(totalItems / pageSize),
      totalItems,
      size: pageSize,
      page: pagination?.pageNumber ?? DEFAULT_PAGINATION.pageNumber!,
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
