import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from '@marxan-api/utils/app-base.service';

import { AppInfoDTO } from '@marxan-api/dto/info.dto';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { FetchSpecification } from 'nestjs-base-service';
import { ScenariosOutputResultsApiEntity } from '@marxan/scenarios-planning-unit';

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
    // TODO implement
    entity.scoreValue = 999;
    entity.costValue = 400;
    entity.planningUnits = 17;
    entity.missingValues = 13;
    entity.runId = 1;

    return entity;
  }
}
