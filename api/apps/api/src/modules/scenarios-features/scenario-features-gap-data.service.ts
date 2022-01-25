import { Brackets, In, Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FetchSpecification, FiltersSpecification } from 'nestjs-base-service';
import {
  AppBaseService,
  JSONAPISerializerConfig,
  PaginationMeta,
} from '../../utils/app-base.service';

import { ScenarioFeaturesGapData } from '@marxan/features';
import { UserSearchCriteria } from './search-criteria';
import { AppConfig } from '../../utils/config.utils';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { GeoFeature } from '../geo-features/geo-feature.api.entity';
import { ScenarioAccessControl } from '@marxan-api/modules/access-control/scenarios-acl/scenario-access-control';
import { assertDefined } from '@marxan/utils';
import { forbiddenError } from '@marxan-api/modules/access-control';
import { Either, left, right } from 'fp-ts/lib/Either';

@Injectable()
export class ScenarioFeaturesGapDataService extends AppBaseService<
  ScenarioFeaturesGapData,
  never,
  never,
  UserSearchCriteria
> {
  constructor(
    @InjectRepository(GeoFeature)
    private readonly features: Repository<GeoFeature>,
    @InjectRepository(ScenarioFeaturesGapData, DbConnections.geoprocessingDB)
    private readonly gapData: Repository<ScenarioFeaturesGapData>,
    private readonly scenarioAclService: ScenarioAccessControl,
  ) {
    super(gapData, 'scenario_features', 'scenario_feature', {
      logging: { muteAll: AppConfig.get<boolean>('logging.muteAll', false) },
    });
  }

  async findAllPaginatedAcl(
    fetchSpecification?: FetchSpecification,
    info?: UserSearchCriteria,
  ): Promise<
    Either<
      typeof forbiddenError,
      {
        data: (Partial<ScenarioFeaturesGapData> | undefined)[];
        metadata: PaginationMeta | undefined;
      }
    >
  > {
    assertDefined(info?.authenticatedUser);
    assertDefined(info.params?.scenarioId);
    if (
      !(await this.scenarioAclService.canViewScenario(
        info.authenticatedUser.id,
        info.params?.scenarioId,
      ))
    ) {
      return left(forbiddenError);
    }
    return right(await super.findAllPaginated(fetchSpecification, info));
  }

  setFilters(
    query: SelectQueryBuilder<ScenarioFeaturesGapData>,
    filters?: FiltersSpecification['filter'],
    info?: UserSearchCriteria,
  ): SelectQueryBuilder<ScenarioFeaturesGapData> {
    const scenarioId = info?.params?.scenarioId;
    if (scenarioId) {
      return query.andWhere(`${this.alias}.scenarioId = :scenarioId`, {
        scenarioId,
      });
    }
    return query;
  }

  async extendFindAllQuery(
    query: SelectQueryBuilder<ScenarioFeaturesGapData>,
    filters?: FiltersSpecification,
    info?: UserSearchCriteria,
  ): Promise<SelectQueryBuilder<ScenarioFeaturesGapData>> {
    // DEBT same issue as
    // `api/apps/api/src/modules/geo-features/geo-features.service.ts`
    // https://github.com/Vizzuality/marxan-cloud/pull/572/files#diff-2b4e531cc05bd4686fb0fc6e5cbf9fd3e2684e40a818179750dc8095bc93d49dR138-R149

    if (!info?.params?.searchPhrase) {
      return query;
    }

    const featuresIds = (
      await this.features
        .createQueryBuilder('features')
        .select('features.id')
        .where(
          new Brackets((orBuilder) =>
            orBuilder
              .where('feature_class_name like :phrase', {
                phrase: `%${info?.params?.searchPhrase}%`,
              })
              .orWhere('alias like :phrase', {
                phrase: `%${info?.params?.searchPhrase}%`,
              }),
          ),
        )
        .getMany()
    ).map((feature) => feature.id);

    if (featuresIds.length > 0) {
      query.andWhere(`feature_id IN (:...featuresIds)`, {
        featuresIds,
      });
    } else {
      query.andWhere(`false`);
    }

    return query;
  }

  async extendFindAllResults(
    entitiesAndCount: [any[], number],
  ): Promise<[any[], number]> {
    /*
     * Here we extend feature protection gap data (from geodb) with feature
     * metadata (name, etc.) from apidb.
     */
    const scenarioFeaturesData: ScenarioFeaturesGapData[] = entitiesAndCount[0] as ScenarioFeaturesGapData[];
    const featureIds: string[] = scenarioFeaturesData.map((i) => i.featureId);

    if (featureIds.length === 0) {
      return entitiesAndCount;
    }

    /**
     * (pseudo)FKs across dbs:
     * (geo)scenario_feature_data.featureClassId -> (geo)feature_data.id
     * (geo)feature_data.feature_id -> (api)feature.id
     */
    const featureRelations: Record<string, string> = {};
    const featureMetadata = await this.features.find({
      where: {
        id: In(featureIds),
      },
    });

    featureMetadata.forEach((fd) => {
      featureRelations[fd.id] = fd.id;
    });

    return [
      scenarioFeaturesData
        .map((sfd) => {
          const relatedFeature = featureMetadata.find(
            (f) => f.id === featureRelations[sfd.featureId],
          );

          if (!relatedFeature) {
            return undefined;
          }

          return this.#injectAndCompute(sfd, relatedFeature);
        })
        .filter((def) => def),
      scenarioFeaturesData.length,
    ];
  }

  get serializerConfig(): JSONAPISerializerConfig<ScenarioFeaturesGapData> {
    return {
      transform: (item: ScenarioFeaturesGapData) => ({
        ...item,
        id: item.featureId,
      }),
      attributes: [
        'scenarioId',
        'featureId',
        'onTarget',
        'metArea',
        'met',
        'totalArea',
        'coverageTargetArea',
        'coverageTarget',
        'featureClassName',
        'name',
        'tag',
        'description',
      ],
      keyForAttribute: 'camelCase',
    };
  }

  #injectAndCompute = (
    base: ScenarioFeaturesGapData,
    assign: GeoFeature,
  ): ScenarioFeaturesGapData => {
    return {
      ...base,
      featureClassName: assign.featureClassName ?? undefined,
      tag: assign.tag,
      name: assign.alias ?? undefined, // `null`
      description: assign.description ?? undefined,
    };
  };
}
