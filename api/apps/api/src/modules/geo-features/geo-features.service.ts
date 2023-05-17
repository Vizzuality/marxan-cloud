import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DeepReadonly } from 'utility-types';
import { AppInfoDTO } from '@marxan-api/dto/info.dto';
import {
  DataSource,
  EntityManager,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { GeoFeatureGeometry, GeometrySource } from '@marxan/geofeatures';
import { geoFeatureResource } from './geo-feature.geo.entity';
import { GeoFeatureSetSpecification } from './dto/geo-feature-set-specification.dto';

import { Geometry } from 'geojson';
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
import { projectNotFound } from '@marxan-api/modules/projects/projects.service';
import { UpdateFeatureNameDto } from '@marxan-api/modules/geo-features/dto/update-feature-name.dto';

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
  typeof geoFeatureFilterKeyNames[number]
>;
type GeoFeatureFilters = Record<GeoFeatureFilterKeys, string[]>;

export const featureNotFound = Symbol('feature not found');
export const featureNotEditable = Symbol('feature cannot be edited');
export const featureNameAlreadyInUse = Symbol('feature name already in use');

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
    @InjectRepository(GeoFeature)
    private readonly geoFeaturesRepository: Repository<GeoFeature>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Scenario)
    private readonly scenarioRepository: Repository<Scenario>,
    private readonly geoFeaturesPropertySet: GeoFeaturePropertySetService,
    private readonly projectAclService: ProjectAclService,
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
    if (projectId && info?.params?.bbox) {
      const { westBbox, eastBbox } = antimeridianBbox(
        nominatim2bbox(info.params.bbox),
      );
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
      const geoFeaturesWithinProjectBbox = await this.geoFeaturesGeometriesRepository
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
      !(entitiesAndCount[1] > 0) ||
      (fetchSpecification?.omitFields &&
        fetchSpecification.omitFields.includes('properties')) ||
      (fetchSpecification?.fields &&
        !fetchSpecification.fields.includes('properties'))
    ) {
      return entitiesAndCount;
    }
    const geoFeatureIds = (entitiesAndCount[0] as GeoFeature[]).map(
      (i) => i.id,
    );

    const entitiesWithProperties = await this.geoFeaturesPropertySet
      .getFeaturePropertySetsForFeatures(geoFeatureIds, info?.params?.bbox)
      .then((results) => {
        return this.geoFeaturesPropertySet.extendGeoFeaturesWithPropertiesFromPropertySets(
          entitiesAndCount[0],
          results,
        );
      });
    return [entitiesWithProperties, entitiesAndCount[1]];
  }

  /**
   * @todo Extend result by adding the feature's property set (see
   * `extendFindAllResults()` above) for singular queries.
   */
  async extendGetByIdResult(
    entity: GeoFeature,
    _fetchSpecification?: FetchSpecification,
    _info?: AppInfoDTO,
  ): Promise<GeoFeature> {
    return entity;
  }

  public async createFeaturesForShapefile(
    projectId: string,
    data: UploadShapefileDTO,
    features: Record<string, any>[],
  ): Promise<void> {
    const apiQueryRunner = this.apiDataSource.createQueryRunner();
    const geoQueryRunner = this.geoDataSource.createQueryRunner();

    await apiQueryRunner.connect();
    await geoQueryRunner.connect();

    await apiQueryRunner.startTransaction();
    await geoQueryRunner.startTransaction();

    try {
      // Create single row in features
      const geofeature = await this.createFeature(
        apiQueryRunner.manager,
        projectId,
        data,
      );

      // Store geometries in features_data table
      for (const feature of features) {
        await this.createFeatureData(
          geoQueryRunner.manager,
          geofeature.id,
          feature.geometry,
          feature.properties,
        );
      }

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
  }

  public async updateFeatureForProject(
    userId: string,
    projectId: string,
    featureId: string,
    updateFeatureNameDto: UpdateFeatureNameDto,
  ): Promise<
    Either<
      | typeof featureNotFound
      | typeof featureNotEditable
      | typeof projectNotFound
      | typeof featureNameAlreadyInUse,
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
      !feature.isCustom ||
      feature.projectId !== projectId ||
      !(await this.projectAclService.canEditProject(userId, projectId))
    ) {
      return left(featureNotEditable);
    }

    const projectsWithSameName = await this.geoFeaturesRepository.count({
      where: {
        featureClassName: updateFeatureNameDto.featureClassName,
        projectId,
      },
    });
    if (projectsWithSameName > 0) {
      return left(featureNameAlreadyInUse);
    }

    await this.geoFeaturesRepository.update(featureId, {
      featureClassName: updateFeatureNameDto.featureClassName,
    });

    return right(true);
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
        creationStatus: JobStatus.done,
      }),
    );
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
}
