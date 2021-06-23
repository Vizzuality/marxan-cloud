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
import { ScenariosOutputResultsGeoEntity } from '@marxan/scenarios-planning-unit';
import { DbConnections } from '@marxan-api/ormconfig.connections';

@Injectable()
export class SolutionResultCrudService extends AppBaseService<
  ScenariosOutputResultsGeoEntity,
  never,
  never,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(
      ScenariosOutputResultsGeoEntity,
      DbConnections.geoprocessingDB,
    )
    protected readonly repository: Repository<ScenariosOutputResultsGeoEntity>,
  ) {
    super(repository, 'solution', 'solutions', {
      logging: { muteAll: AppConfig.get<boolean>('logging.muteAll', false) },
    });
  }

  get serializerConfig(): JSONAPISerializerConfig<ScenariosOutputResultsGeoEntity> {
    return {
      attributes: [
        'id',
        'planningUnits',
        'missingValues',
        'cost',
        'score',
        'run',
      ],
      keyForAttribute: 'camelCase',
    };
  }

  async extendFindAllResults(
    entitiesAndCount: [ScenariosOutputResultsGeoEntity[], number],
    _fetchSpecification?: FetchSpecification,
    _info?: AppInfoDTO,
  ): Promise<[ScenariosOutputResultsGeoEntity[], number]> {
    const extendedEntities: Promise<ScenariosOutputResultsGeoEntity>[] = entitiesAndCount[0].map(
      (entity) => this.extendGetByIdResult(entity),
    );
    return [await Promise.all(extendedEntities), entitiesAndCount[1]];
  }

  async extendGetByIdResult(
    entity: ScenariosOutputResultsGeoEntity,
    _fetchSpecification?: FetchSpecification,
    _info?: AppInfoDTO,
  ): Promise<ScenariosOutputResultsGeoEntity> {
    // TODO implement
    entity.planningUnits = 17;
    entity.missingValues = 13;
    entity.cost = 400;
    entity.score = 999;
    entity.run = 1;
    return entity;
  }
}
