import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepReadonly } from 'utility-types';
import { AppInfoDTO } from '@marxan-api/dto/info.dto';
import {
  EntityManager,
  getConnection,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import {
  GeoFeatureGeometry,
  geoFeatureResource,
} from './geo-feature.geo.entity';
import { GeoFeatureSetSpecification } from './dto/geo-feature-set-specification.dto';

import { Geometry } from 'geojson';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from '@marxan-api/utils/app-base.service';
import { GeoFeature } from './geo-feature.api.entity';
import { FetchSpecification } from 'nestjs-base-service';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { JobStatus, Scenario } from '../scenarios/scenario.api.entity';
import { GeoFeaturePropertySetService } from './geo-feature-property-sets.service';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { GeometrySource } from './geometry-source.enum';
import { v4 } from 'uuid';
import { UploadShapefileDTO } from '../projects/dto/upload-shapefile.dto';
import { GeoFeaturesRequestInfo } from './geo-features-request-info';

const geoFeatureFilterKeyNames = [
  'featureClassName',
  'alias',
  'description',
  'source',
  'propertyName',
  'tag',
  'projectId',
] as const;
type GeoFeatureFilterKeys = keyof Pick<
  GeoFeature,
  typeof geoFeatureFilterKeyNames[number]
>;
type GeoFeatureFilters = Record<GeoFeatureFilterKeys, string[]>;

@Injectable()
export class GeoFeaturesService extends AppBaseService<
  GeoFeature,
  GeoFeatureSetSpecification,
  GeoFeatureSetSpecification,
  GeoFeaturesRequestInfo
> {
  constructor(
    @InjectRepository(GeoFeatureGeometry, DbConnections.geoprocessingDB)
    private readonly geoFeaturesGeometriesRepository: Repository<GeoFeatureGeometry>,
    @InjectRepository(GeoFeature)
    private readonly geoFeaturesRepository: Repository<GeoFeature>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Scenario)
    private readonly scenarioRepository: Repository<Scenario>,
    private readonly geoFeaturesPropertySet: GeoFeaturePropertySetService,
  ) {
    super(
      geoFeaturesRepository,
      geoFeatureResource.name.singular,
      geoFeatureResource.name.plural,
      {
        logging: { muteAll: AppConfig.get<boolean>('logging.muteAll', false) },
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
        'tag',
        'properties',
      ],
      keyForAttribute: 'camelCase',
    };
  }

  /**
   * Apply service-specific filters.
   */
  setFilters(
    query: SelectQueryBuilder<GeoFeature>,
    filters: GeoFeatureFilters,
    info?: GeoFeaturesRequestInfo,
  ): SelectQueryBuilder<GeoFeature> {
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

    // find over api.features may not be best, as pagination does reflect
    // actual page/pageSize vs actual items

    // making search via intersection of whole PA vs all features
    // may not be best for performance... but ain't we doing it anyway?

    // also, current approach may fail as we are using IDs directly (typeorm
    // limits - what we cannot overcome unless we duplicate data or make a
    // special "cache/view" (per project?)

    // current query just 'attaches' 'like' clause in separation of previously
    // fetched features (so it may get public ones that are not within study area)

    /**
     * potential solution but it may be messing much?
     *
     * 1 keep searching over features_data (intersection) [could be cached
     * at some point, per project]
     * 2 move api.features into geo.features_data ...
     * 3 which also fixes issues with:
     *    * searching via tag
     *    * searching via name
     *    * pagination
     *    * searching within one query (table) and single db
     *    * reduces unnecessary relations and system accidental complexity
     *
     */
    if (projectId && info?.params?.bbox) {
      const geoFeaturesWithinProjectBbox = await this.geoFeaturesGeometriesRepository
        .createQueryBuilder('geoFeatureGeometries')
        .distinctOn(['"geoFeatureGeometries"."feature_id"'])
        .where(
          `st_intersects(
        st_makeenvelope(:xmin, :ymin, :xmax, :ymax, 4326),
        "geoFeatureGeometries".the_geom
      )`,
          {
            xmin: info.params.bbox[1],
            ymin: info.params.bbox[3],
            xmax: info.params.bbox[0],
            ymax: info.params.bbox[2],
          },
        )
        .getMany()
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

    if (info.params?.featureTag) {
      queryFilteredByPublicOrProjectSpecificFeatures.andWhere(
        `${this.alias}.tag = :tag`,
        { tag: info.params.featureTag },
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
    const [apiDbConnection, geoDbConnection] = [
      getConnection(DbConnections.default),
      getConnection(DbConnections.geoprocessingDB),
    ];

    const apiQueryRunner = apiDbConnection.createQueryRunner();
    const geoQueryRunner = geoDbConnection.createQueryRunner();

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
        tag: data.type,
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
