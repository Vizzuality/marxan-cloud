import { BaseServiceResource } from '@marxan-api/types/resource.interface';

import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppInfoDTO } from '@marxan-api/dto/info.dto';
import { Brackets, IsNull, Not, Repository, SelectQueryBuilder} from 'typeorm';
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
import { Scenario } from '../scenarios/scenario.api.entity';
import _, {groupBy, intersection, isArray} from 'lodash';
import { ProjectSnapshot } from '@marxan/projects';
import { SelectionGetService } from '@marxan-api/modules/scenarios/protected-area/getter/selection-get.service';
import { Either, left, right } from 'fp-ts/Either';
import { UpdateProtectedAreaNameDto } from '@marxan-api/modules/protected-areas/dto/rename.protected-area.dto';
import { ProjectAclService } from '@marxan-api/modules/access-control/projects-acl/project-acl.service';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { ProtectedAreasRequestInfo } from '@marxan-api/modules/protected-areas/dto/protected-areas-request-info';

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

export const globalProtectedAreaNotEditable = Symbol(
  'global protected area cannot be renamed',
);

export const globalProtectedAreaNotDeletable = Symbol(
  'global protected area cannot be deleted',
);
export const protectedAreaNotFound = Symbol('protected area not found');

export const customProtectedAreaNotEditableByUser = Symbol(
  'User not allowed to edit protected areas of the project',
);

export const customProtectedAreaNotDeletableByUser = Symbol(
  'User not allowed to delete protected areas of the project',
);

export const customProtectedAreaIsUsedInOneOrMoreScenarios = Symbol(
  'Custom protected area is used in one or more scenarios',
);

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
    @InjectRepository(Scenario)
    protected readonly scenarioRepository: Repository<Scenario>,
    @InjectRepository(Project)
    protected readonly projectRepository: Repository<Project>,
    @Inject(forwardRef(() => SelectionGetService))
    private readonly selectionGetService: SelectionGetService,
    private readonly projectAclService: ProjectAclService,
  ) {
    super(repository, 'protected_area', 'protected_areas', {
      logging: { muteAll: AppConfig.getBoolean('logging.muteAll', false) },
    });
  }

  async setFilters(
    query: SelectQueryBuilder<ProtectedArea>,
    filters: ProtectedAreaBaseFilters & ProtectedAreaFilters,
    _info?: AppInfoDTO,
  ): Promise<SelectQueryBuilder<ProtectedArea>> {
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
        'scenarioUsageCount',
        'isCustom',
        'name',
      ],
      keyForAttribute: 'camelCase',
    };
  }

  async extendFindAllQuery(
    query: SelectQueryBuilder<ProtectedArea>,
    fetchSpecification: FetchSpecification,
    info: ProtectedAreasRequestInfo,
  ): Promise<SelectQueryBuilder<ProtectedArea>> {
    const project: ProjectSnapshot | undefined = info?.params?.project;

    if (project) {
      const projectGlobalProtectedAreasData = await this.selectionGetService.getGlobalProtectedAreas(
        project,
      );

      const uniqueCategoryGlobalProtectedAreasIds: string[] = []

      for (const category of projectGlobalProtectedAreasData.categories) {
        const wdpaOfCategorySample = await this.repository.findOneOrFail({where: {iucnCategory: category as IUCNCategory}})
        uniqueCategoryGlobalProtectedAreasIds.push(wdpaOfCategorySample.id)
      }

      query.andWhere(
        new Brackets((qb) => {
          qb.where(`${this.alias}.projectId = :projectId`, {
            projectId: project.id,
          }).orWhere(`${this.alias}.id in (:...ids)`, {
            ids: uniqueCategoryGlobalProtectedAreasIds,
          })
        }),
      )
    }

    if (Array.isArray(info?.params?.ids) && info?.params?.ids.length) {
      query.andWhere('id in (:...ids)', { ids: info?.params?.ids });
    }

    if (info?.params?.fullNameAndCategoryFilter) {
      query.andWhere(
        `(${this.alias}.full_name ilike :fullNameAndCategoryFilter OR ${this.alias}.iucn_cat ilike :fullNameAndCategoryFilter)`,
        {
          fullNameAndCategoryFilter: `%${info.params.fullNameAndCategoryFilter}%`,
        },
      );
    }

    return query;
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
      results.data
        .map((i) => ({
          iucnCategory: i?.iucnCategory,
        }))
        .filter((i): i is IUCNProtectedAreaCategoryDTO => !!i.iucnCategory),
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

  async listForProject(
    project: ProjectSnapshot,
    fetchSpecification?: FetchSpecification,
    info?: ProtectedAreasRequestInfo,
  ) {
    /**
     * Get a list of protected areas used in project scenarios and assemble this
     * into a map of protected area ids to lists of the scenarios where each
     * protected area is in use.
     */
    const protectedAreaUsedInProjectScenarios = await this.scenarioRepository
      .find({
        where: {
          projectId: project.id,
          protectedAreaFilterByIds: Not(IsNull()),
        },
      })
      .then((scenarios) =>
        groupBy(
          scenarios.flatMap((scenario) =>
            scenario.protectedAreaFilterByIds
              ?.filter(isDefined)
              .map((protectedAreaId) => ({
                scenarioId: scenario.id,
                protectedAreaId,
              })),
          ),
          'protectedAreaId',
        ),
      );

    /**
     * Get a list of all the protected areas that are linked to a given project,
     * and add a count of the number of scenarios where each protected area is
     * used.
     */

    info!.params.project = project;

    /** if the fetchSpecification contains sort or filter with 'name' property, we need to remove it from fetch specification
     * used for base service findAll method, because 'name' column does not exist in protected_areas table and error will occur
     * Filtering and sorting by 'name' will be done manually later in this method
     */

    const editedFetchSpecification = JSON.parse(JSON.stringify(fetchSpecification))

    if(fetchSpecification?.filter?.name) {
      delete editedFetchSpecification?.filter?.name;
    }

    if(fetchSpecification?.sort?.includes('name') || fetchSpecification?.sort?.includes('-name')) {
      editedFetchSpecification?.sort?.splice(editedFetchSpecification?.sort?.indexOf('name'), 1);
      editedFetchSpecification?.sort?.splice(editedFetchSpecification?.sort?.indexOf('-name'), 1);
    }

    const projectProtectedAreas = await this.findAll(
      editedFetchSpecification,
      info,
    );

    let result: any[] = [];

    projectProtectedAreas[0].forEach((protectedArea: any) => {
      const scenarioUsageCount: number = protectedAreaUsedInProjectScenarios[
        protectedArea!.id!
      ]
        ? protectedAreaUsedInProjectScenarios[protectedArea!.id!].length
        : 0;
      const name = protectedArea.fullName === null ? protectedArea.iucnCategory : protectedArea.fullName;
      result.push({
        ...protectedArea,
        scenarioUsageCount,
        isCustom: protectedArea!.projectId !== null,
        name
      });
    });


    // Applying filtering and sorting manually for 'name' property

    if(fetchSpecification?.filter?.name) {
      const filterNames: string[] = fetchSpecification?.filter?.name as string[];
      result = result.filter((pa) => {
        return filterNames.includes(pa.name)
      });
    }

    if (fetchSpecification?.sort?.includes('name') || fetchSpecification?.sort?.includes('-name')) {
      if(fetchSpecification?.sort?.includes('name')) {
        result.sort((a, b) => a.name.localeCompare(b.name));
      } else {
        result.sort((a, b) => b.name.localeCompare(a.name));
      }

    }

    // Serialising final result

    const serializer = new JSONAPISerializer.Serializer(
      'protected_areas', this.serializerConfig,
    );

    return serializer.serialize(result);
  }

  public async updateProtectedAreaName(
    userId: string,
    protectedAreaId: string,
    updateProtectedAreaNameDto: UpdateProtectedAreaNameDto,
  ): Promise<
    Either<
      | typeof protectedAreaNotFound
      | typeof globalProtectedAreaNotEditable
      | typeof customProtectedAreaNotEditableByUser,
      ProtectedArea
    >
  > {
    const protectedArea = await this.repository.findOne({
      where: { id: protectedAreaId },
    });
    if (!protectedArea) {
      return left(protectedAreaNotFound);
    }
    if (!protectedArea.projectId) {
      return left(globalProtectedAreaNotEditable);
    }

    if (
      !(await this.projectAclService.canEditProject(
        userId,
        protectedArea.projectId,
      ))
    ) {
      return left(customProtectedAreaNotEditableByUser);
    }

    await this.repository.update(protectedAreaId, {
      fullName: updateProtectedAreaNameDto.name,
    });

    const updatedProtectedArea = await this.repository.findOneOrFail({
      where: { id: protectedAreaId },
    });
    return right(updatedProtectedArea);
  }

  public async deleteProtectedArea(
    userId: string,
    protectedAreaId: string,
  ): Promise<
    Either<
      | typeof protectedAreaNotFound
      | typeof globalProtectedAreaNotDeletable
      | typeof customProtectedAreaNotDeletableByUser
      | typeof customProtectedAreaIsUsedInOneOrMoreScenarios,
      true
    >
  > {
    const protectedArea = await this.repository.findOne({
      where: { id: protectedAreaId },
    });
    if (!protectedArea) {
      return left(protectedAreaNotFound);
    }
    if (!protectedArea.projectId) {
      return left(globalProtectedAreaNotDeletable);
    }

    if (
      !(await this.projectAclService.canEditProject(
        userId,
        protectedArea.projectId,
      ))
    ) {
      return left(customProtectedAreaNotDeletableByUser);
    }

    const project = await this.projectRepository.findOneOrFail({
      where: { id: protectedArea.projectId },
    });

    const projectProtectedAreas = await this.listForProject(project);
    const protectedAreaData = projectProtectedAreas.data.find(
      (pa: ProtectedArea) => pa.id === protectedAreaId,
    );
    if (protectedAreaData?.attributes.scenarioUsageCount > 0) {
      return left(customProtectedAreaIsUsedInOneOrMoreScenarios);
    }

    await this.repository.delete(protectedAreaId);

    return right(true);
  }
}
