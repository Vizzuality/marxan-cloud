import { BaseServiceResource } from 'types/resource.interface';

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppInfoDTO } from 'dto/info.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateProtectedAreaDTO } from './dto/create.protected-area.dto';
import { UpdateProtectedAreaDTO } from './dto/update.protected-area.dto';
import { ProtectedArea } from './protected-area.geo.entity';
import JSONAPISerializer = require('jsonapi-serializer');

import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import { isNil } from 'lodash';
import { FetchSpecification } from 'nestjs-base-service';
import {
  IUCNProtectedAreaCategoryDTO,
  IUCNProtectedAreaCategoryResult,
} from './dto/iucn-protected-area-category.dto';
import { AdminAreasService } from 'modules/admin-areas/admin-areas.service';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export const protectedAreaResource: BaseServiceResource = {
  className: 'ProtectedArea',
  name: {
    singular: 'protected_area',
    plural: 'protected_areas',
  },
};

class ProtectedAreaFilters {
  /**
   * Whether we should only select the iucnCategory prop (rather than the whole
   * entity).
   */
  @IsOptional()
  @IsBoolean()
  onlyCategories: boolean;

  @IsOptional()
  @IsUUID(4)
  adminAreaId: string;
}

@Injectable()
export class ProtectedAreasService extends AppBaseService<
  ProtectedArea,
  CreateProtectedAreaDTO,
  UpdateProtectedAreaDTO,
  AppInfoDTO
> {
  private readonly logger = new Logger(ProtectedAreasService.name);

  constructor(
    @InjectRepository(ProtectedArea, 'geoprocessingDB')
    protected readonly repository: Repository<ProtectedArea>,
  ) {
    super(repository, 'protected_area', 'protected_areas');
  }

  setFilters(
    query: SelectQueryBuilder<ProtectedArea>,
    filters: ProtectedAreaFilters,
    info?: AppInfoDTO,
  ): SelectQueryBuilder<ProtectedArea> {
    /**
     * @debt This is a bit of a hack - here we are bending a wrong abstraction
     * to avoid duplication and boilerplate. `setFilters()` should not be a land
     * of too many ifs.
     */
    if (filters?.onlyCategories) {
      query.select(`${this.alias}.iucnCategory`, 'iucnCategory').distinct(true);
    }

    /**
     * If we have an adminAreaId, narrow the selection to protected areas within
     * the given admin area.
     *
     * @debt @testsNeeded @unitTests @propBasedTests We only support looking up
     * protected areas for single admin areas. This should be properly tested.
     */
    if (filters?.adminAreaId) {
      let whereClause: string;
      if (AdminAreasService.levelFromId(filters.adminAreaId) === 0) {
        whereClause = `gid_0 = '${filters.adminAreaId}' and gid_1 is null and gid_2 is null`;
      } else if (AdminAreasService.levelFromId(filters.adminAreaId) === 1) {
        whereClause = `gid_1 = '${filters.adminAreaId}' and gid_2 is null`;
      } else if (AdminAreasService.levelFromId(filters.adminAreaId) === 2) {
        whereClause = `gid_2 = '${filters.adminAreaId}'`;
      } else {
        throw new BadRequestException(
          'An invalid administrative area id may have been provided.',
        );
      }
      query.andWhere(`st_intersects(the_geom, (select the_geom from admin_regions a
        WHERE ${whereClause}))`);
    }

    return query;
  }

  get serializerConfig(): JSONAPISerializerConfig<ProtectedArea> {
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

  /**
   * @todo This is just a stub.
   */
  async importProtectedAreaShapefile(
    _file: Express.Multer.File,
  ): Promise<ProtectedArea> {
    return new ProtectedArea();
  }

  /**
   * List IUCN categories of protected areas.
   */
  async listProtectedAreaCategories(): Promise<Array<string | undefined>> {
    const results = await this.repository
      .createQueryBuilder(this.alias)
      .select(`${this.alias}.iucnCategory`, 'iucnCategory')
      .distinct(true)
      .getRawMany<ProtectedArea>()
      .then((results) =>
        results.map((i) => i.iucnCategory).filter((i) => !isNil(i)),
      );
    return results;
  }

  /**
   * List IUCN categories of protected areas, serializing to a JSON:API response
   * payload.
   */
  async findAllProtectedAreaCategories(
    fetchSpecification: FetchSpecification,
    info?: AppInfoDTO,
    filters?: Record<string, unknown>,
  ): Promise<IUCNProtectedAreaCategoryResult[]> {
    const results = await this.findAllPaginatedRaw(
      { ...fetchSpecification },
      undefined,
      {
        ...filters,
        onlyCategories: true,
      },
    ).then((results) =>
      results.data.map((i: IUCNProtectedAreaCategoryDTO) => ({
        iucnCategory: i?.iucnCategory,
      })),
    );

    const serializer = new JSONAPISerializer.Serializer(
      'iucn_protected_area_categories',
      {
        attributes: ['iucnCategory'],
        keyForAttribute: 'camelCase',
      },
    );

    return serializer.serialize(results);
  }
}
