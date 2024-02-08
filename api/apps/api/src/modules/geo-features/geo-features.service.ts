import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  InjectDataSource,
  InjectEntityManager,
  InjectRepository,
} from '@nestjs/typeorm';
import { DeepReadonly } from 'utility-types';
import {
  DataSource,
  EntityManager,
  Not,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { GeoFeatureGeometry, GeometrySource } from '@marxan/geofeatures';
import { geoFeatureResource } from './geo-feature.geo.entity';
import { GeoFeatureSetSpecification } from './dto/geo-feature-set-specification.dto';

import { BBox, Geometry } from 'geojson';
import {
  AppBaseService,
  JSONAPISerializerConfig,
  PaginationMeta,
} from '@marxan-api/utils/app-base.service';
import { GeoFeature } from './geo-feature.api.entity';
import { FetchSpecification } from 'nestjs-base-service';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { JobStatus, Scenario } from '../scenarios/scenario.api.entity';
import { GeoFeaturePropertySetService } from './geo-feature-property-sets.service';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { v4 } from 'uuid';
import { UploadShapefileDTO } from '../projects/dto/upload-shapefile.dto';
import { GeoFeaturesRequestInfo } from './geo-features-request-info';
import { antimeridianBbox, nominatim2bbox } from '@marxan/utils/geo';
import { Either, left, right } from 'fp-ts/lib/Either';
import { ProjectAclService } from '@marxan-api/modules/access-control/projects-acl/project-acl.service';
import {
  projectNotFound,
  projectNotVisible,
} from '@marxan-api/modules/projects/projects.service';
import { UpdateFeatureNameDto } from '@marxan-api/modules/geo-features/dto/update-feature-name.dto';
import { ScenarioFeaturesService } from '@marxan-api/modules/scenarios-features';
import { GeoFeatureTag } from '@marxan-api/modules/geo-feature-tags/geo-feature-tag.api.entity';
import {
  featureNotFoundWithinProject,
  GeoFeatureTagsService,
} from '@marxan-api/modules/geo-feature-tags/geo-feature-tags.service';
import { FeatureAmountUploadService } from '@marxan-api/modules/geo-features/import/features-amounts-upload.service';
import { isNil } from 'lodash';
import {
  FeatureAmountsPerPlanningUnitEntity,
  FeatureAmountsPerPlanningUnitService,
} from '@marxan/feature-amounts-per-planning-unit';
import { ComputeFeatureAmountPerPlanningUnit } from '@marxan/feature-amounts-per-planning-unit/feature-amounts-per-planning-units.service';
import { CHUNK_SIZE_FOR_BATCH_APIDB_OPERATIONS } from '@marxan-api/utils/chunk-size-for-batch-apidb-operations';

const geoFeatureFilterKeyNames = [
  'featureClassName',
  'alias',
  'description',
  'source',
  'propertyName',
  'projectId',
] as const;
type GeoFeatureFilterKeys = keyof Pick<
  GeoFeature,
  (typeof geoFeatureFilterKeyNames)[number]
>;
type GeoFeatureFilters = Record<GeoFeatureFilterKeys, string[]>;

export const featureNotFound = Symbol('feature not found');
export const featureNotEditable = Symbol('feature cannot be edited');

export const featureDataCannotBeUploadedWithCsv = Symbol(
  'feature data cannot be uploaded with csv',
);
export const featureNameAlreadyInUse = Symbol('feature name already in use');
export const featureNotDeletable = Symbol('feature cannot be deleted');
export const featureIsLinkedToOneOrMoreScenarios = Symbol(
  'feature is linked to one or more scenarios',
);
export const importedFeatureNameAlreadyExist = Symbol(
  'imported feature cannot have the same name as existing feature',
);

export const missingPuidColumnInFeatureAmountCsvUpload = Symbol(
  'missing puid column in feature amount csv upload',
);

export const unknownPuidsInFeatureAmountCsvUpload = Symbol(
  'there are unknown PUids in feature amount csv upload',
);

export type FindResult = {
  data: (Partial<GeoFeature> | undefined)[];
  metadata: PaginationMeta | undefined;
};

@Injectable()
export class GeoFeaturesService extends AppBaseService<
  GeoFeature,
  GeoFeatureSetSpecification,
  GeoFeatureSetSpecification,
  GeoFeaturesRequestInfo
> {
  constructor(
    @InjectDataSource(DbConnections.default)
    private readonly apiDataSource: DataSource,
    @InjectDataSource(DbConnections.geoprocessingDB)
    private readonly geoDataSource: DataSource,
    @InjectRepository(GeoFeatureGeometry, DbConnections.geoprocessingDB)
    private readonly geoFeaturesGeometriesRepository: Repository<GeoFeatureGeometry>,
    @InjectEntityManager()
    private readonly apiEntityManager: EntityManager,
    @InjectEntityManager(DbConnections.geoprocessingDB)
    private readonly geoEntityManager: EntityManager,
    @InjectRepository(GeoFeature)
    private readonly geoFeaturesRepository: Repository<GeoFeature>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Scenario)
    private readonly scenarioRepository: Repository<Scenario>,
    private readonly geoFeaturesPropertySet: GeoFeaturePropertySetService,
    private readonly geoFeatureTagsServices: GeoFeatureTagsService,
    @Inject(forwardRef(() => ScenarioFeaturesService))
    private readonly scenarioFeaturesService: ScenarioFeaturesService,
    private readonly projectAclService: ProjectAclService,
    private readonly featureAmountUploads: FeatureAmountUploadService,
    private readonly featureAmountsPerPlanningUnitService: FeatureAmountsPerPlanningUnitService,
  ) {
    super(
      geoFeaturesRepository,
      geoFeatureResource.name.singular,
      geoFeatureResource.name.plural,
      {
        logging: { muteAll: AppConfig.getBoolean('logging.muteAll', false) },
      },
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<GeoFeature> {
    return {
      attributes: [
        'featureClassName',
        'alias',
        'description',
        'source',
        'propertyName',
        'intersection',
        'properties',
        'isCustom',
        'tag',
        'scenarioUsageCount',
        'amountRange',
      ],
      keyForAttribute: 'camelCase',
    };
  }

  /**
   * Apply service-specific filters.
   */
  async setFilters(
    query: SelectQueryBuilder<GeoFeature>,
    filters: GeoFeatureFilters,
    info?: GeoFeaturesRequestInfo,
  ): Promise<SelectQueryBuilder<GeoFeature>> {
    this._processBaseFilters<GeoFeatureFilters>(
      query,
      filters,
      geoFeatureFilterKeyNames,
    );
    if (Array.isArray(info?.params?.ids) && info?.params?.ids.length) {
      query.andWhere('id in (:...ids)', { ids: info?.params?.ids });
    }
    return query;
  }

  async extendFindAllQuery(
    query: SelectQueryBuilder<GeoFeature>,
    fetchSpecification: FetchSpecification,
    info: GeoFeaturesRequestInfo,
  ): Promise<SelectQueryBuilder<GeoFeature>> {
    /**
     * We should either list only "public" features (i.e. they are not from a
     * pool of user-uploaded project-specific ones) or, if a `projectId` is
     * provided, public features plus project-specific ones for the given
     * project.
     *
     * projectId may be coming our way either via info.params.projectId (if this
     * is added within the API) of via fetchSpecification.filter.projectId (if
     * it is supplied as part of a GET query parsed according to the JSON:API
     * spec), and if a projectId is supplied in either way, we first check if
     * the project exists (if not, we throw a NotFoundException).
     *
     * In any case, when we have a projectId, we also limit the selection of
     * features to those that intersect the project's bbox.
     */

    let queryFilteredByPublicOrProjectSpecificFeatures;
    const projectId: string | undefined =
      (info?.params?.projectId as string) ??
      (fetchSpecification?.filter?.projectId as string);

    /**
     * @debt Finding over api.features may not be best, as pagination does not
     * reflect actual page/pageSize vs actual items
     *
     * Potential solutions (with caveat - they may require extensive refactor):
     *
     * 0. store bbox of each feature
     *    (`st_makeenvelope(st_union(features_data.the_geom))` for the feature's
     *    geometries) in geodb to intersect faster
     *
     * 1. keep searching over features_data (intersection) [could be cached at
     *    some point, per project]
     *
     * 2. move api.features into geo.features_data ...
     *
     * 3. which could also fix issues with:
     *    * searching via name
     *    * pagination
     *    * searching within one query (table) and single db
     *    * unnecessary relations and system accidental complexity
     */
    if (projectId) {
      if (info?.params?.bbox) {
        const geoFeaturesWithinProjectBbox =
          await this.getIntersectingProjectFeatures(
            info.params.bbox,
            projectId,
          );

        // Only apply narrowing by intersection with project bbox if there are
        // features falling within said bbox; otherwise return an empty set
        // by short-circuiting the query.
        if (geoFeaturesWithinProjectBbox?.length > 0) {
          query.andWhere(
            `${this.alias}.id IN (:...geoFeaturesWithinProjectBbox)`,
            { geoFeaturesWithinProjectBbox },
          );
        } else {
          query.andWhere('false');
        }
      }

      query = this.extendFindAllGeoFeaturesWithTags(
        query,
        fetchSpecification,
        info,
      );

      queryFilteredByPublicOrProjectSpecificFeatures = query.andWhere(
        `(${this.alias}.projectId = :projectId OR ${this.alias}.projectId IS NULL)`,
        { projectId },
      );
    } else {
      queryFilteredByPublicOrProjectSpecificFeatures = query.andWhere(
        `${this.alias}.projectId IS NULL`,
      );
    }

    if (info?.params?.featureClassAndAliasFilter) {
      queryFilteredByPublicOrProjectSpecificFeatures.andWhere(
        `(${this.alias}.alias ilike :featureClassAndAliasFilter OR ${this.alias}.featureClassName ilike :featureClassAndAliasFilter)`,
        {
          featureClassAndAliasFilter: `%${info.params.featureClassAndAliasFilter}%`,
        },
      );
    }

    return queryFilteredByPublicOrProjectSpecificFeatures;
  }

  /**
   * Join properties and their unique values across all the features_data rows
   * in the geodb with the GeoFeatures data fetched so far.
   *
   * We do this "join" here as data is split across the api and the geo dbs,
   * and we are not using FDWs so far.
   */
  async extendFindAllResults(
    entitiesAndCount: [any[], number],
    fetchSpecification?: DeepReadonly<FetchSpecification>,
    info?: GeoFeaturesRequestInfo,
  ): Promise<[any[], number]> {
    if (entitiesAndCount[1] === 0) {
      return entitiesAndCount;
    }

    const extendedResults = entitiesAndCount;
    const omitFields = fetchSpecification?.omitFields;
    const fields = fetchSpecification?.include;

    /**
     * Short-circuit if there's no result to extend, or if the API client has
     * asked to omit specific fields and these do include `properties`.
     *
     * The case where the API client explicitly asks for specific fields is
     * slightly different: since `properties` is not a column of the entity
     * associated to this service and is only added to the 'result DTO' here,
     * asking for `?fields=properties` in an API query would result in a SQL
     * error; nevertheless, we can short-circuit here in any case, assuming that
     * if the API client is asking only for specific fields, it would be safe to
     * omit any additional fields which would normally be loaded as part of a
     * 'result DTO'.
     */
    if (
      !(omitFields && omitFields.includes('properties')) &&
      fields &&
      fields.includes('properties')
    ) {
      const geoFeatureIds = (entitiesAndCount[0] as GeoFeature[]).map(
        (i) => i.id,
      );

      extendedResults[0] = await this.geoFeaturesPropertySet
        .getFeaturePropertySetsForFeatures(geoFeatureIds, info?.params?.bbox)
        .then((results) => {
          return this.geoFeaturesPropertySet.extendGeoFeaturesWithPropertiesFromPropertySets(
            entitiesAndCount[0],
            results,
          );
        });
    }

    if (!(omitFields && omitFields.includes('tag'))) {
      extendedResults[0] =
        await this.geoFeatureTagsServices.extendFindAllGeoFeaturesWithTags(
          extendedResults[0],
        );
    }

    if (
      !(omitFields && omitFields.includes('scenarioUsageCount')) &&
      info?.params?.projectId
    ) {
      // Note: Scenario usage is calculated within a given project, so a projectId is expected on the request
      // Currently there's no endpoint/call to geofeature's find method without it, but a check is still put in place
      // unless the need for opposite rises in the future
      extendedResults[0] = await this.extendFindAllGeoFeatureWithScenarioUsage(
        extendedResults[0],
        info?.params?.projectId,
      );
    }

    return extendedResults;
  }

  /**
   * @todo Extend result by adding the feature's property set (see
   * `extendFindAllResults()` above) for singular queries.
   */
  async extendGetByIdResult(
    entity: GeoFeature,
    _fetchSpecification?: FetchSpecification,
    _info?: GeoFeaturesRequestInfo,
  ): Promise<GeoFeature> {
    const omitFields = _fetchSpecification?.omitFields;
    let extendedResult = entity;

    if (!(omitFields && omitFields.includes('tag'))) {
      extendedResult =
        await this.geoFeatureTagsServices.extendFindGeoFeatureWithTag(entity);
    }

    if (
      !(omitFields && omitFields.includes('scenarioUsageCount')) &&
      _info?.params?.projectId
      // See notes on the corresponding section in extendFindAllResult
    ) {
      extendedResult = await this.extendFindGeoFeatureWithScenarioUsage(
        entity,
        _info?.params?.projectId,
      );
    }

    return extendedResult;
  }

  public async createFeaturesForShapefile(
    projectId: string,
    data: UploadShapefileDTO,
    features: Record<string, any>[],
  ): Promise<Either<Error, GeoFeature>> {
    /**
     * @debt Avoid duplicating transaction scaffolding in multiple sites
     * within this class: this should be wrapped in a utility method, and the
     * code to be executed within transactions, as well as error handling
     * (`catch`) and cleanup (`finally`) should be passed to the utility method.
     */
    const apiQueryRunner = this.apiDataSource.createQueryRunner();
    const geoQueryRunner = this.geoDataSource.createQueryRunner();

    await apiQueryRunner.connect();
    await geoQueryRunner.connect();

    await apiQueryRunner.startTransaction();
    await geoQueryRunner.startTransaction();

    let geoFeature: GeoFeature;
    try {
      // Create single row in features
      geoFeature = await this.createFeature(
        apiQueryRunner.manager,
        projectId,
        data,
      );

      //Create Tag if provided
      await this.createFeatureTag(
        apiQueryRunner.manager,
        projectId,
        geoFeature.id,
        data.tagName,
      );

      // Store geometries in features_data table
      for (const feature of features) {
        await this.createFeatureData(
          geoQueryRunner.manager,
          geoFeature.id,
          feature.geometry,
          feature.properties,
        );
      }

      const computedFeatureAmounts =
        await this.featureAmountsPerPlanningUnitService.computeMarxanAmountPerPlanningUnit(
          geoFeature.id,
          projectId,
          geoQueryRunner.manager,
        );

      await this.saveFeatureAmountPerPlanningUnit(
        geoQueryRunner.manager,
        projectId,
        computedFeatureAmounts,
      );

      await this.saveAmountRangeForFeatures(
        [geoFeature.id],
        apiQueryRunner.manager,
        geoQueryRunner.manager,
      );

      await apiQueryRunner.commitTransaction();
      await geoQueryRunner.commitTransaction();
    } catch (err) {
      await apiQueryRunner.rollbackTransaction();
      await geoQueryRunner.rollbackTransaction();

      this.logger.error(
        'An error occurred creating features for shapefile (changes have been rolled back)',
        String(err),
      );
      throw err;
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await apiQueryRunner.release();
      await geoQueryRunner.release();
    }

    return right(geoFeature);
  }

  private async saveFeatureAmountPerPlanningUnit(
    geoEntityManager: EntityManager,
    projectId: string,
    featureAmounts: ComputeFeatureAmountPerPlanningUnit[],
  ): Promise<void> {
    const repo = geoEntityManager.getRepository(
      FeatureAmountsPerPlanningUnitEntity,
    );
    await repo.save(
      featureAmounts.map(({ amount, projectPuId, featureId }) => ({
        projectId,
        featureId,
        amount,
        projectPuId,
      })),
      { chunk: CHUNK_SIZE_FOR_BATCH_APIDB_OPERATIONS },
    );
  }

  private async deleteFeatureAmountsPerPlanningUnit(
    geoEntityManager: EntityManager,
    featureId: string,
  ): Promise<void> {
    const repo = geoEntityManager.getRepository(
      FeatureAmountsPerPlanningUnitEntity,
    );
    await repo.delete({ featureId });
  }

  public async updateFeatureForProject(
    userId: string,
    featureId: string,
    updateFeatureNameDto: UpdateFeatureNameDto,
  ): Promise<
    Either<
      | typeof featureNotFound
      | typeof featureNotEditable
      | typeof featureNameAlreadyInUse,
      GeoFeature
    >
  > {
    const feature = await this.geoFeaturesRepository.findOne({
      where: { id: featureId },
    });
    if (!feature) {
      return left(featureNotFound);
    }
    if (!feature.isCustom || !feature.projectId) {
      return left(featureNotEditable);
    }

    if (
      !(await this.projectAclService.canEditProject(userId, feature.projectId))
    ) {
      return left(featureNotEditable);
    }

    const projectFeaturesWithSameName = await this.geoFeaturesRepository.count({
      where: {
        id: Not(feature.id),
        featureClassName: updateFeatureNameDto.featureClassName,
        projectId: feature.projectId,
      },
    });
    if (projectFeaturesWithSameName > 0) {
      return left(featureNameAlreadyInUse);
    }

    await this.geoFeaturesRepository.update(featureId, {
      featureClassName: updateFeatureNameDto.featureClassName,
    });

    const updatedFeature = await this.geoFeaturesRepository.findOneOrFail({
      where: { id: featureId },
    });
    return right(updatedFeature);
  }

  public async deleteFeature(
    userId: string,
    projectId: string,
    featureId: string,
  ): Promise<
    Either<
      | typeof projectNotFound
      | typeof featureNotFound
      | typeof featureIsLinkedToOneOrMoreScenarios
      | typeof featureNotDeletable,
      true
    >
  > {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if (!project) {
      return left(projectNotFound);
    }

    const feature = await this.geoFeaturesRepository.findOne({
      where: { id: featureId },
    });
    if (!feature) {
      return left(featureNotFound);
    }

    if (
      await this.scenarioFeaturesService.isFeaturePresentInAnyScenario(
        featureId,
      )
    ) {
      return left(featureIsLinkedToOneOrMoreScenarios);
    }

    if (
      !feature.isCustom ||
      feature.projectId !== projectId ||
      !(await this.projectAclService.canDeleteFeatureInProject(
        userId,
        projectId,
      ))
    ) {
      return left(featureNotDeletable);
    }

    /**
     * @debt Avoid duplicating transaction scaffolding in multiple sites within
     * this class: this should be wrapped in a utility method, and the code to
     * be executed within transactions, as well as error handling (`catch`) and
     * cleanup (`finally`) should be passed to the utility method.
     */
    const apiQueryRunner = this.apiDataSource.createQueryRunner();
    const geoQueryRunner = this.geoDataSource.createQueryRunner();

    await apiQueryRunner.connect();
    await geoQueryRunner.connect();

    await apiQueryRunner.startTransaction();
    await geoQueryRunner.startTransaction();

    try {
      /**
       * Delete the feature, as well as its associated amount per planning unit
       * data.
       *
       * This is fast, and leaving amount per planning unit data behind until it
       * is eventually garbage-collected by a scheduled cleanup task may cause
       * issues with piece exporters/importers, so it is ok to delete this
       * associated data straight away.
       *
       * Other feature data (such as spatial data) can be left to the cleanup
       * tasks to delete when suitable, as doing so synchronously at this stage
       * would be a potentially expensive operation.
       */
      await apiQueryRunner.manager.delete(GeoFeature, { id: featureId });
      await this.deleteFeatureAmountsPerPlanningUnit(
        geoQueryRunner.manager,
        featureId,
      );
      await apiQueryRunner.commitTransaction();
      await geoQueryRunner.commitTransaction();
    } catch (err) {
      await apiQueryRunner.rollbackTransaction();
      await geoQueryRunner.rollbackTransaction();

      this.logger.error(
        `An error occurred while deleting feature with id ${featureId} or any of its related data (changes have been rolled back)`,
        String(err),
      );
      throw err;
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await apiQueryRunner.release();
      await geoQueryRunner.release();
    }

    return right(true);
  }

  private extendFindAllGeoFeaturesWithTags(
    query: SelectQueryBuilder<GeoFeature>,
    fetchSpecification: FetchSpecification,
    info: GeoFeaturesRequestInfo,
  ): SelectQueryBuilder<GeoFeature> {
    const tagSortRegex = /^-?tag$/i;
    //Check whether the request has any tag related parameter
    const tagFilters = fetchSpecification.filter?.tag;

    // check if user asked to sort by `tag` (ascending) or -tag (descending)
    //
    // if user asked for tag as filter in more than one way or capitalization,
    // take the first occurrence; maybe we should throw an error instead?
    //TODO explanation
    const sortByTagSpec = fetchSpecification.sort?.filter(
      (i) => i.match(tagSortRegex)?.length,
    )[0];

    if (
      !(tagFilters && Array.isArray(tagFilters) && tagFilters.length) &&
      !sortByTagSpec
    ) {
      return query;
    }

    // first join the tag table and then apply criteria to the main query as needed

    const tagTableAlias = 'feature_tag';
    query.leftJoin(
      GeoFeatureTag,
      'feature_tag',
      `feature_tag.feature_id = "${this.alias}".id`,
    );

    if (tagFilters && Array.isArray(tagFilters) && tagFilters.length) {
      query.andWhere(`${tagTableAlias}.tag IN (:...tagFilters)`, {
        tagFilters,
      });
    }

    if (sortByTagSpec) {
      // because of the way that TypeORM handles pagination with
      // if using an Order By on a query that is paginated using .take() and skip() on the querybuilder ( as nestjs-base-service
      // does internally) and the query has a join, it is mandatory to include the sorting column in the select clause
      // of the query because of how TypeORM processes the query internally on that specific case
      // https://github.com/typeorm/typeorm/blob/ff6e8751d98dfe9999ee21906cca7d20b1c6b15d/src/query-builder/SelectQueryBuilder.ts#L3408-L3415
      // https://github.com/typeorm/typeorm/issues/4742
      query.addSelect(`${tagTableAlias}.tag`);

      query.addOrderBy(
        `${tagTableAlias}.tag`,
        sortByTagSpec.match(/^-/) ? 'DESC' : 'ASC',
        'NULLS LAST',
      );

      // remove `tag` or `-tag` from list of sort-by columns
      fetchSpecification.sort = fetchSpecification.sort?.filter((i) =>
        isNil(i.match(tagSortRegex)),
      );
    }

    return query;
  }

  private async getIntersectingProjectFeatures(
    bbox: BBox,
    projectId: string,
  ): Promise<any[]> {
    const { westBbox, eastBbox } = antimeridianBbox(nominatim2bbox(bbox));
    /**
     * First get all feature ids that _may_ be relevant to the project
     * (irrespective of whether they intersect the project's bbox, which we
     * check later).
     *
     * Moreover, never include features that have been obtained by splitting
     * (or, in the future, stratifying) other features - that is, features
     * obtained through geoprocessing operations on "raw"/original features.
     *
     * In practice, this would be done nevertheless at this stage when only
     * the `split` geoprocessing operation is actively supported, because only
     * ids of "raw"/original features are ever used in
     * `(geodb)features_data.feature_id (i.e. not ids of features obtained by
     * splitting a "raw" feature), but we add here this guard as a proper
     * filter on the `(apidb).features` data alone, in case the filtering by
     * bbox below is changed or replaced in any way that may affect the
     * "implicit" exclusion of geoprocessed feature ids.
     *
     * This filter will need to be revisited if/when enabling stratification,
     * as that geoprocessing operation _will_ create new
     * `(geodb)features_data` rows, which will likely reference the
     * intersected feature stored in `(apidb)features` (which will have a
     * non-null `geoprocessing_ops_hash` value).
     */
    const publicOrProjectSpecificFeatures = await this.geoFeaturesRepository
      .query(
        `
          SELECT id FROM features
            WHERE
              project_id IS NULL
              AND
              geoprocessing_ops_hash IS NULL
          UNION
          SELECT id FROM features
            WHERE
              project_id = $1
              AND
              geoprocessing_ops_hash IS NULL;
          `,
        [projectId],
      )
      .then((result) => result.map((i: { id: string }) => i.id));

    /**
     * Then narrow down the list of features relevant to the project to those
     * that effectively intersect the project's bbox.
     */
    const geoFeaturesWithinProjectBbox =
      await this.geoFeaturesGeometriesRepository
        .createQueryBuilder('geoFeatureGeometries')
        .select('"geoFeatureGeometries"."feature_id"', 'featureId')
        .distinctOn(['"geoFeatureGeometries"."feature_id"'])
        .where(`feature_id IN (:...featureIds)`)
        .andWhere(
          `(st_intersects(
              st_intersection(st_makeenvelope(:...eastBbox, 4326),
              ST_MakeEnvelope(0, -90, 180, 90, 4326)),
          "geoFeatureGeometries".the_geom
        ) or st_intersects(
          st_intersection(st_makeenvelope(:...westBbox, 4326),
            ST_MakeEnvelope(-180, -90, 0, 90, 4326)),
            "geoFeatureGeometries".the_geom
        ))`,
          {
            featureIds: publicOrProjectSpecificFeatures,
            westBbox: westBbox,
            eastBbox: eastBbox,
          },
        )
        .getRawMany()
        .then((result) => result.map((i) => i.featureId))
        .catch((error) => {
          throw new Error(error);
        });

    return geoFeaturesWithinProjectBbox;
  }

  private async createFeature(
    entityManager: EntityManager,
    projectId: string,
    data: UploadShapefileDTO,
  ): Promise<GeoFeature> {
    const repo = entityManager.getRepository(GeoFeature);
    return await repo.save(
      repo.create({
        id: v4(),
        featureClassName: data.name,
        description: data.description,
        projectId,
        creationStatus: JobStatus.created,
      }),
    );
  }

  private async createFeatureTag(
    entityManager: EntityManager,
    projectId: string,
    featureId: string,
    tagName?: string,
  ): Promise<void> {
    if (!tagName) {
      return;
    }
    const repo = entityManager.getRepository(GeoFeatureTag);
    await repo.save(
      repo.create({
        projectId,
        featureId,
        tag: tagName,
      }),
    );

    //TODO Update the last modified at of all equivalent tag rows
  }

  private async createFeatureData(
    entityManager: EntityManager,
    featureId: string,
    geometry: Geometry,
    properties: Record<string, string | number>,
  ): Promise<void> {
    await entityManager.query(
      `INSERT INTO "features_data"
       ("id", "the_geom", "properties", "source", "feature_id")
       VALUES (DEFAULT, ST_MakeValid(ST_GeomFromGeoJSON($1)::geometry), $2, $3,
               $4);`,
      [geometry, properties, GeometrySource.user_imported, featureId],
    );
  }

  // TODO: this should be a 2 step process: We temporarily store the new features and their amounts
  //       after a user confirms which ones actually include

  async saveFeaturesFromCsv(
    fileBuffer: Buffer,
    projectId: string,
    userId: string,
  ): Promise<
    Either<
      | typeof importedFeatureNameAlreadyExist
      | typeof unknownPuidsInFeatureAmountCsvUpload
      | typeof projectNotFound
      | typeof featureDataCannotBeUploadedWithCsv,
      GeoFeature[]
    >
  > {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if (!project) {
      return left(projectNotFound);
    }

    if (
      !(await this.projectAclService.canUploadFeatureDataWithCsvInProject(
        userId,
        projectId,
      ))
    ) {
      return left(featureDataCannotBeUploadedWithCsv);
    }

    return await this.featureAmountUploads.uploadFeatureFromCsv({
      fileBuffer,
      projectId,
      userId,
    });
  }

  private async extendFindAllGeoFeatureWithScenarioUsage(
    geoFeatures: GeoFeature[],
    projectId: string,
  ): Promise<GeoFeature[]> {
    const featureIds = geoFeatures.map((i) => i.id);

    const scenarioIds = (
      await this.scenarioRepository.find({
        select: { id: true },
        where: { projectId },
      })
    ).map((scenario) => scenario.id);

    let scenarioUsages: {
      id: string;
      usage: number;
    }[] = [];

    if (scenarioIds.length > 0) {
      scenarioUsages = await this.geoEntityManager
        .createQueryBuilder()
        .select('api_feature_id', 'id')
        .addSelect('COUNT(DISTINCT sfd.scenario_id)', 'usage')
        .from('scenario_features_data', 'sfd')
        .where('sfd.api_feature_id IN (:...featureIds)', { featureIds })
        .andWhere('sfd.scenario_id IN (:...scenarioIds)', { scenarioIds })
        .groupBy('api_feature_id')
        .execute();
    }

    return geoFeatures.map((feature) => {
      const scenarioUsage = scenarioUsages.find((el) => el.id === feature.id);

      return {
        ...feature,
        scenarioUsageCount: scenarioUsage ? Number(scenarioUsage.usage) : 0,
      } as GeoFeature;
    });
  }

  private async extendFindGeoFeatureWithScenarioUsage(
    feature: GeoFeature,
    projectId: string,
  ): Promise<GeoFeature> {
    const scenarioIds = (
      await this.scenarioRepository.find({
        select: { id: true },
        where: { projectId },
      })
    ).map((scenario) => scenario.id);

    const [usage]: {
      count: number;
    }[] = await this.geoEntityManager
      .createQueryBuilder()
      .select('COUNT(DISTINCT sfd.scenario_id', 'count')
      .from('scenario_features_data', 'sfd')
      .where('sfd.api_feature_id = featureId', { featureId: feature.id })
      .andWhere('sfd.scenario_id IN (:...scenarioIds)', { scenarioIds })
      .execute();

    return {
      ...feature,
      scenarioUsageCount: usage ? Number(usage.count) : 0,
    } as GeoFeature;
  }

  async saveAmountRangeForFeatures(
    featureIds: string[],
    apiEntityManager?: EntityManager,
    geoEntityManager?: EntityManager,
  ) {
    apiEntityManager = apiEntityManager
      ? apiEntityManager
      : this.apiEntityManager;
    geoEntityManager = geoEntityManager
      ? geoEntityManager
      : this.geoEntityManager;

    this.logger.log(`Saving min and max amounts for new features...`);

    const minAndMaxAmountsForFeatures = await geoEntityManager
      .createQueryBuilder()
      .select('feature_id', 'id')
      .addSelect('MIN(amount)', 'amountMin')
      .addSelect('MAX(amount)', 'amountMax')
      .from('feature_amounts_per_planning_unit', 'fappu')
      .where('fappu.feature_id IN (:...featureIds)', { featureIds })
      .groupBy('fappu.feature_id')
      .getRawMany();

    if (minAndMaxAmountsForFeatures.length === 0) {
      throw new Error('Error saving Min/Max amounts for given features ');
    }

    const minMaxSqlValueStringForFeatures = minAndMaxAmountsForFeatures
      .map(
        (feature) =>
          `(uuid('${feature.id}'), ${feature.amountMin}, ${feature.amountMax})`,
      )
      .join(', ');

    const query = `
        update features set
           amount_min = minmax.min,
           amount_max = minmax.max
        from (
        values
            ${minMaxSqlValueStringForFeatures}
        ) as minmax(feature_id, min, max)
        where features.id = minmax.feature_id;`;
    await apiEntityManager.query(query);
  }

  async checkProjectFeatureVisibility(
    userId: string,
    projectId: string,
    featureId: string,
  ): Promise<
    Either<
      typeof featureNotFoundWithinProject | typeof projectNotVisible,
      GeoFeature
    >
  > {
    const projectFeature = await this.geoFeaturesRepository.findOne({
      where: { id: featureId, projectId },
    });

    if (!projectFeature) {
      return left(featureNotFoundWithinProject);
    }
    if (!(await this.projectAclService.canViewProject(userId, projectId))) {
      return left(projectNotVisible);
    }

    return right(projectFeature);
  }
}
