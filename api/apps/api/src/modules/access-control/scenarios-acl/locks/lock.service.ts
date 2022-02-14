import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Either, left, right } from 'fp-ts/lib/Either';

import { ScenarioLockEntity } from '@marxan-api/modules/access-control/scenarios-acl/locks/entity/scenario.lock.api.entity';
import {
  ScenarioLockDto,
  ScenarioLockResultPlural,
  ScenarioLockResultSingular,
} from './dto/scenario.lock.dto';

export const unknownError = Symbol(`unknown error`);
export const lockedScenario = Symbol(`scenario is already locked`);
export const lockedByAnotherUser = Symbol(
  `scenario is locked by a different user`,
);
export const noLockInPlace = Symbol(`scenario has no locks`);

export type AcquireFailure = typeof unknownError | typeof lockedScenario;

@Injectable()
export class LockService {
  constructor(
    @InjectRepository(ScenarioLockEntity)
    private readonly locksRepo: Repository<ScenarioLockEntity>,
  ) {}

  async acquireLock(
    scenarioId: string,
    userId: string,
  ): Promise<Either<AcquireFailure, ScenarioLockDto>> {
    return this.locksRepo.manager.transaction(async (entityManager) => {
      if (await this.isLocked(scenarioId)) {
        return left(lockedScenario);
      }

      const lock = new ScenarioLockEntity();
      lock.scenarioId = scenarioId;
      lock.userId = userId;
      lock.createdAt = new Date();

      const result = await entityManager.save(lock);

      return right(result);
    });
  }

  async getAllLocksByProject(
    projectId: string,
  ): Promise<ScenarioLockResultPlural> {
    const query = this.locksRepo
      .createQueryBuilder('scenario_locks')
      .leftJoinAndSelect('scenario_locks.scenario', 'scenario')
      .leftJoinAndSelect('scenario.project', 'project')
      .where('project.id = :projectId', { projectId })
      .select([
        'scenario_locks.userId',
        'scenario_locks.scenarioId',
        'scenario_locks.createdAt',
      ]);

    const allLocksByProject = await query.getMany();

    return { data: allLocksByProject };
  }

  async getLock(scenarioId: string): Promise<ScenarioLockResultSingular> {
    const result = await this.locksRepo.findOne({ scenarioId });

    if (!result) {
      return { data: null };
    }

    return { data: result };
  }

  async releaseLock(scenarioId: string): Promise<void> {
    await this.locksRepo.delete({ scenarioId });
  }

  async isLocked(scenarioId: string): Promise<boolean> {
    return (await this.locksRepo.count({ where: { scenarioId } })) > 0;
  }

  async isLockedByUser(scenarioId: string, userId: string): Promise<boolean> {
    return (await this.locksRepo.count({ where: { scenarioId, userId } })) > 0;
  }
}
