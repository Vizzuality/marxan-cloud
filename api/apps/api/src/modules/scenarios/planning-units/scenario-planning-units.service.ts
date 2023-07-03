import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { DbConnections } from '@marxan-api/ormconfig.connections';
import {
  LockStatus,
  ScenariosPlanningUnitGeoEntity,
} from '@marxan/scenarios-planning-unit';

@Injectable()
export class ScenarioPlanningUnitsService {
  constructor(
    @InjectRepository(
      ScenariosPlanningUnitGeoEntity,
      DbConnections.geoprocessingDB,
    )
    private readonly puRepo: Repository<ScenariosPlanningUnitGeoEntity>,
    @InjectEntityManager(DbConnections.geoprocessingDB)
    private readonly entityManager: EntityManager,
  ) {}

  async get(scenarioId: string): Promise<ScenariosPlanningUnitGeoEntity[]> {
    return this.puRepo.find({
      where: {
        scenarioId,
      },
    });
  }

  async getByStatusSetByUser(
    scenarioId: string,
    lockStatus: LockStatus,
  ): Promise<ScenariosPlanningUnitGeoEntity[]> {
    return await this.puRepo.find({
      where: {
        scenarioId,
        lockStatus,
        setByUser: true,
      },
    });
  }

  async getAvailablePUsSetByUser(
    scenarioId: string,
  ): Promise<ScenariosPlanningUnitGeoEntity[]> {
    return await this.puRepo
      .createQueryBuilder('scenarioPuData')
      .where('scenarioPuData.scenario_id = :scenarioId', { scenarioId })
      .andWhere('scenarioPuData.lockin_status IS NULL')
      .andWhere('scenarioPuData.lock_status_set_by_user = false')
      .getMany();
  }

  async resetLockStatus(scenarioId: string): Promise<void> {
    return await this.entityManager.transaction(async (manager) => {
      await manager.update(
        ScenariosPlanningUnitGeoEntity,
        {
          scenarioId,
          protectedByDefault: false,
        },
        {
          lockStatus: LockStatus.Available,
          setByUser: false,
        },
      );

      await manager.update(
        ScenariosPlanningUnitGeoEntity,
        {
          scenarioId,
          protectedByDefault: true,
        },
        {
          lockStatus: LockStatus.LockedIn,
          setByUser: false,
        },
      );
    });
  }
}
