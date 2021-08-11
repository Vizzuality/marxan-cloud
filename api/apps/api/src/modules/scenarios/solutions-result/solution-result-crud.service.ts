import { Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from '@marxan-api/utils/app-base.service';

import { AppInfoDTO } from '@marxan-api/dto/info.dto';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { FetchSpecification } from 'nestjs-base-service';
import { ScenariosOutputResultsApiEntity } from '@marxan/marxan-output';

const scenariosOutputResultsFilterKeyNames = ['scenarioId'] as const;
type ScenariosOutputResultsFilterKeys = keyof Pick<
  ScenariosOutputResultsApiEntity,
  typeof scenariosOutputResultsFilterKeyNames[number]
>;
type ScenarioOutputResultsFilters = Record<
  ScenariosOutputResultsFilterKeys,
  string[]
>;

@Injectable()
export class SolutionResultCrudService extends AppBaseService<
  ScenariosOutputResultsApiEntity,
  never,
  never,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(ScenariosOutputResultsApiEntity)
    protected readonly repository: Repository<ScenariosOutputResultsApiEntity>,
  ) {
    super(repository, 'solution', 'solutions', {
      logging: { muteAll: AppConfig.get<boolean>('logging.muteAll', false) },
    });
  }

  get serializerConfig(): JSONAPISerializerConfig<ScenariosOutputResultsApiEntity> {
    return {
      attributes: [
        'id',
        'runId',
        'scoreValue',
        'costValue',
        'missingValues',
        'planningUnits',
      ],
      keyForAttribute: 'camelCase',
    };
  }

  setFilters(
    query: SelectQueryBuilder<ScenariosOutputResultsApiEntity>,
    filters: ScenarioOutputResultsFilters,
    _info?: AppInfoDTO,
  ): SelectQueryBuilder<ScenariosOutputResultsApiEntity> {
    if (filters?.scenarioId) {
      query.andWhere(`${this.alias}.scenarioId = :scenarioId`, {
        scenarioId: filters.scenarioId,
      });
    } else {
      throw new Error(
        'Scenario solutions have been requested but no scenarioId has been supplied. This is likely a bug.',
      );
    }

    return query;
  }

  async extendFindAllResults(
    entitiesAndCount: [ScenariosOutputResultsApiEntity[], number],
    _fetchSpecification?: FetchSpecification,
    _info?: AppInfoDTO,
  ): Promise<[ScenariosOutputResultsApiEntity[], number]> {
    const extendedEntities: Promise<ScenariosOutputResultsApiEntity>[] = entitiesAndCount[0].map(
      (entity) => this.extendGetByIdResult(entity),
    );
    return [await Promise.all(extendedEntities), entitiesAndCount[1]];
  }

  async extendGetByIdResult(
    entity: ScenariosOutputResultsApiEntity,
    _fetchSpecification?: FetchSpecification,
    _info?: AppInfoDTO,
  ): Promise<ScenariosOutputResultsApiEntity> {
    return entity;
  }
}
