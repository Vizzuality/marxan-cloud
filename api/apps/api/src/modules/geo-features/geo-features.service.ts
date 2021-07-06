import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppInfoDTO } from '@marxan-api/dto/info.dto';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import {
  GeoFeatureGeometry,
  GeoFeaturePropertySet,
  geoFeatureResource,
} from './geo-feature.geo.entity';
import { CreateGeoFeatureSetDTO } from './dto/create.geo-feature-set.dto';

import * as faker from 'faker';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from '@marxan-api/utils/app-base.service';
import {
  FeatureTags,
  GeoFeature,
  GeoFeatureProperty,
} from './geo-feature.api.entity';
import { FetchSpecification } from 'nestjs-base-service';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { apiConnections } from '@marxan-api/ormconfig';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { Scenario } from '../scenarios/scenario.api.entity';
import { RemoteScenarioFeaturesData } from '../scenarios-features/entities/remote-scenario-features-data.geo.entity';

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

export const EntityManagerToken = Symbol();

export const MarxanFeaturesMetadata = {
  defaults: {
    fpf: 1,
  },
};

@Injectable()
export class GeoFeaturesService extends AppBaseService<
  GeoFeature,
  CreateGeoFeatureSetDTO,
  CreateGeoFeatureSetDTO,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(GeoFeatureGeometry, apiConnections.geoprocessingDB.name)
    private readonly geoFeaturesGeometriesRepository: Repository<GeoFeatureGeometry>,
    @InjectRepository(
      GeoFeaturePropertySet,
      apiConnections.geoprocessingDB.name,
    )
    private readonly geoFeaturePropertySetsRepository: Repository<GeoFeaturePropertySet>,
    @InjectRepository(GeoFeature)
    private readonly geoFeaturesRepository: Repository<GeoFeature>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Scenario)
    private readonly scenarioRepository: Repository<Scenario>,
    @Inject(EntityManagerToken)
    private readonly entityManager: EntityManager,
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

  private forProject?: Project | null;

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

  async fakeFindOne(_id: string): Promise<GeoFeature> {
    return {
      ...new GeoFeature(),
      id: faker.random.uuid(),
      featureClassName: faker.random.alphaNumeric(15),
      alias: faker.random.words(8),
      propertyName: faker.random.words(8),
      intersection: [...Array(4)].map((_i) => faker.random.uuid()),
      tag: faker.random.arrayElement(Object.values(FeatureTags)),
      properties: [...Array(6)].map((_i) => this._fakeGeoFeatureProperty()),
    };
  }

  private _fakeGeoFeatureProperty(): GeoFeatureProperty {
    return {
      key: faker.random.word(),
      distinctValues: [...Array(8)].map((_i) => faker.random.words(6)),
    };
  }

  /**
   * Apply service-specific filters.
   */
  setFilters(
    query: SelectQueryBuilder<GeoFeature>,
    filters: GeoFeatureFilters,
    info?: AppInfoDTO,
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
    info: AppInfoDTO,
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
    if (projectId) {
      this.forProject = await this.projectRepository
        .findOneOrFail(projectId)
        .then((project) => project)
        .catch((_error) => {
          throw new NotFoundException(
            `No project with id ${projectId} exists.`,
          );
        });
      const geoFeaturesWithinProjectBbox = await this.geoFeaturesGeometriesRepository
        .createQueryBuilder('geoFeatureGeometries')
        .where(
          `st_intersects(
        st_makeenvelope(:xmin, :ymin, :xmax, :ymax, 4326),
        "geoFeatureGeometries".the_geom
      )`,
          {
            xmin: this.forProject.bbox[1],
            ymin: this.forProject.bbox[3],
            xmax: this.forProject.bbox[0],
            ymax: this.forProject.bbox[2],
          },
        )
        .getMany()
        .then((result) => result.map((i) => i.featureId))
        .catch((error) => {
          throw new Error(error);
        });

      queryFilteredByPublicOrProjectSpecificFeatures = query.andWhere(
        `${this.alias}.projectId = :projectId OR ${this.alias}.projectId IS NULL
        AND ${this.alias}.id IN (:...geoFeaturesWithinProjectBbox)`,
        { projectId, geoFeaturesWithinProjectBbox },
      );
    } else {
      queryFilteredByPublicOrProjectSpecificFeatures = query.andWhere(
        `${this.alias}.projectId IS NULL`,
      );
    }

    if (info?.params?.featureClassAndAliasFilter) {
      queryFilteredByPublicOrProjectSpecificFeatures.andWhere(
        `${this.alias}.alias ilike :featureClassAndAliasFilter OR ${this.alias}.featureClassName ilike :featureClassAndAliasFilter`,
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
    fetchSpecification?: FetchSpecification,
    _info?: AppInfoDTO,
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
    const query = this.geoFeaturePropertySetsRepository
      .createQueryBuilder('propertySets')
      .distinct(true)
      .where(`propertySets.featureId IN (:...ids)`, { ids: geoFeatureIds });

    if (this.forProject) {
      query.andWhere(
        `st_intersects(
        st_makeenvelope(:xmin, :ymin, :xmax, :ymax, 4326),
        "propertySets".bbox
      )`,
        {
          xmin: this.forProject.bbox[1],
          ymin: this.forProject.bbox[3],
          xmax: this.forProject.bbox[0],
          ymax: this.forProject.bbox[2],
        },
      );
    }

    const entitiesWithProperties = await query.getMany().then((results) => {
      return (entitiesAndCount[0] as GeoFeature[]).map((i) => {
        const propertySetForFeature = results.filter(
          (propertySet) => propertySet.featureId === i.id,
        );
        return {
          ...i,
          properties: propertySetForFeature.reduce((acc, cur) => {
            return {
              ...acc,
              [cur.key]: [...(acc[cur.key] || []), cur.value[0]],
            };
          }, {} as Record<string, Array<string | number>>),
        };
      });
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

  /**
   * Given a specification for features to be linked to a scenario, compute
   * features defined via geoprocessing operations and link plain features
   * and features from geoprocessing to the scenario.
   */
  async createFeaturesForScenario(
    scenarioId: string,
    featureSpecification: Pick<CreateGeoFeatureSetDTO, 'features'>,
  ): Promise<void> {
    await this.entityManager.transaction(async (transactionalEntityManager) => {
      const repository = transactionalEntityManager.getRepository(
        RemoteScenarioFeaturesData,
      );
      await repository.delete({ scenarioId });
      // First process features which can be used as they are (plain)
      await Promise.all(
        featureSpecification.features
          .filter((feature) => feature.kind === 'plain')
          .map((feature) => {
            return repository.save({
              scenarioId,
              featuresDataId: feature.featureId,
              fpf:
                feature.marxanSettings?.fpf ??
                MarxanFeaturesMetadata.defaults.fpf,
              prop: feature.marxanSettings?.prop,
            });
          }),
      );
      // Then process features from geoprocessing operations of kind `split/v1`
      // TODO
      // Then process features from geoprocessing operations of kind `stratification/v1`
      // TODO
    });
  }

  /**
   * Add feature metadata to features in a geofeatures processing recipe.
   */
  async extendGeoFeatureProcessingRecipe(
    recipe: CreateGeoFeatureSetDTO,
  ): Promise<any> {
    const featuresInRecipe = recipe.features.map(
      (feature) => feature.featureId,
    );
    const metadataForFeaturesInRecipe = await this.findAll(undefined, {
      params: { ids: featuresInRecipe },
    }).then((result) => result[0]);
    return {
      status: recipe.status,
      features: recipe.features.map((feature) => {
        return {
          ...feature,
          metadata: metadataForFeaturesInRecipe.find(
            (f) => f.id === feature.featureId,
          ),
        };
      }),
    };
  }

  /**
   * Create or replace the set of features linked to a scenario.
   */
  async createOrReplaceFeatureSet(
    id: string,
    dto: CreateGeoFeatureSetDTO,
  ): Promise<CreateGeoFeatureSetDTO | undefined> {
    const scenario = await this.scenarioRepository.findOneOrFail(id);
    await this.scenarioRepository.update(id, { featureSet: dto });
    await this.createFeaturesForScenario(id, dto);
    return await this.extendGeoFeatureProcessingRecipe(dto);
  }
}
