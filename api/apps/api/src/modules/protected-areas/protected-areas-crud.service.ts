import { BaseServiceResource } from '@marxan-api/types/resource.interface';

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppInfoDTO } from '@marxan-api/dto/info.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateProtectedAreaDTO } from './dto/create.protected-area.dto';
import { UpdateProtectedAreaDTO } from './dto/update.protected-area.dto';
import { ProtectedArea } from '@marxan/protected-areas';
import * as JSONAPISerializer from 'jsonapi-serializer';

import {
  AppBaseService,
  JSONAPISerializerConfig,
} from '@marxan-api/utils/app-base.service';
import { FetchSpecification } from 'nestjs-base-service';
import {
  IUCNProtectedAreaCategoryDTO,
  IUCNProtectedAreaCategoryResult,
} from './dto/iucn-protected-area-category.dto';
import { AdminAreasService } from '@marxan-api/modules/admin-areas/admin-areas.service';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { apiConnections } from '../../ormconfig';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { IUCNCategory } from '@marxan/iucn';
import { isDefined } from '@marxan/utils';
import { isRight } from 'fp-ts/lib/Either';

const protectedAreaFilterKeyNames = [
  'fullName',
  'wdpaId',
  'iucnCategory',
  'status',
  'designation',
  'countryId',
] as const;
type ProtectedAreaFilterKeys = keyof Pick<
  ProtectedArea,
  typeof protectedAreaFilterKeyNames[number]
>;
type ProtectedAreaBaseFilters = Record<ProtectedAreaFilterKeys, string[]>;

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
  onlyCategories?: boolean;

  @IsOptional()
  @IsUUID(4)
  adminAreaId?: string;

  @IsOptional()
  @IsUUID(4)
  customAreaId?: string;
}

// TODO candidate to deletion; scenario-crud uses one method
@Injectable()
export class ProtectedAreasCrudService extends AppBaseService<
  ProtectedArea,
  CreateProtectedAreaDTO,
  UpdateProtectedAreaDTO,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(ProtectedArea, apiConnections.geoprocessingDB.name)
    protected readonly repository: Repository<ProtectedArea>,
  ) {
    super(repository, 'protected_area', 'protected_areas', {
      logging: { muteAll: AppConfig.get<boolean>('logging.muteAll', false) },
    });
  }

  setFilters(
    query: SelectQueryBuilder<ProtectedArea>,
    filters: ProtectedAreaBaseFilters & ProtectedAreaFilters,
    _info?: AppInfoDTO,
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
    /**
     * @debt  a bit of another dirty hack we need to validate that the user has access to that id
     *
     */
    if (filters?.customAreaId) {
      query.andWhere(`st_intersects(the_geom, (select the_geom from planning_areas a
        WHERE a.id = '${filters.customAreaId}'))`);
    }

    query = this._processBaseFilters<ProtectedAreaBaseFilters>(
      query,
      filters,
      protectedAreaFilterKeyNames,
    );

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
   * List IUCN categories of protected areas.
   */
  async listProtectedAreaCategories(): Promise<Array<string>> {
    return await this.repository
      .createQueryBuilder(this.alias)
      .select(`${this.alias}.iucnCategory`, 'iucnCategory')
      .distinct(true)
      .getRawMany<ProtectedArea>()
      .then((results) => results.map((i) => i.iucnCategory).filter(isDefined));
  }

  /**
   * List IUCN categories of protected areas, serializing to a JSON:API response
   * payload.
   */
  async findAllProtectedAreaCategories(
    fetchSpecification: FetchSpecification,
  ): Promise<IUCNProtectedAreaCategoryResult[]> {
    const results = await this.findAllPaginatedRaw({
      ...fetchSpecification,
      filter: { ...fetchSpecification.filter, onlyCategories: true },
    }).then((results) =>
      // Transform ProtectedArea into IUCNProtectedAreaCategoryDTO - the latter
      // is a subset of the former, with the twist that the only property we
      // are interested in (iucnCategory) *may* be undefined in ProtectedArea
      // so we need to filter out entities where this property is undefined.
      isRight(results)
        ? results.right.data
            .map((i) => ({
              iucnCategory: i?.iucnCategory,
            }))
            .filter((i): i is IUCNProtectedAreaCategoryDTO => !!i.iucnCategory)
        : results.left,
    );

    const serializer = new JSONAPISerializer.Serializer(
      'iucn_protected_area_categories',
      {
        /**
         * We map the id property to `iucnCategory`. It may be more consistent,
         * in principle, to create an actual `id` prop on
         * `IUCNProtectedAreaCategoryDTO` with a getter (returning the value of
         * the `iucnCategory` property) but alas, this [TypeScript
         * limitation](https://github.com/microsoft/TypeScript/issues/14417)
         * would make the use of such an implementation even more clumsy than
         * adding an ad-hoc id mapping here.
         */
        id: 'iucnCategory',
        attributes: ['iucnCategory'],
        keyForAttribute: 'camelCase',
      },
    );

    return serializer.serialize(results);
  }

  /**
   * Find all the WDPA protected areas whose IUCN category is within those
   * provided, that fall within the given planning area.
   *
   * @todo This should be refactored to take into account a planned FK from
   * protected areas to their upstream database so that we can limit the
   * selection to records that were added via a specific WDPA upstream release.
   *
   * In practice, we don't allow users to set the IUCN category prop when
   * creating a new protected area record via geometry upload, so a record
   * having the iucnCategory property set is a reliable proxy of areas whose
   * source is WDPA (without taking into account WDPA releases, which we don't
   * currently support).
   */
  async findAllWDPAProtectedAreasInPlanningAreaByIUCNCategory(
    planningAreaId: string,
    planningAreaTableName: string,
    iucnCategories: IUCNCategory[],
  ): Promise<ProtectedArea[]> {
    return await this.repository
      .createQueryBuilder(this.alias)
      .where(
        `${this.alias}.iucnCategory IN (:...iucnCategories)
        AND st_intersects(${this.alias}.the_geom,
        (select the_geom from ${planningAreaTableName} pa WHERE pa.id = :planningAreaId));`,
        { planningAreaId, iucnCategories },
      )
      .getMany();
  }
}
