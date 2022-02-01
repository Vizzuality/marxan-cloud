import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Either, left, right } from 'fp-ts/lib/Either';

import { ScenarioLockEntity } from '@marxan-api/modules/scenarios/locks/entity/scenario.lock.api.entity';
import { forbiddenError } from '@marxan-api/modules/access-control';
import { ScenarioAccessControl } from '@marxan-api/modules/access-control/scenarios-acl/scenario-access-control';
import { ScenarioLockDto } from './dto/scenario.lock.dto';

export const unknownError = Symbol(`unknown error`);
export const lockedScenario = Symbol(`scenario is already locked`);

export type AcquireFailure = typeof unknownError | typeof lockedScenario;

@Injectable()
export class LockService {
  constructor(
    @InjectRepository(ScenarioLockEntity)
    private readonly locksRepo: Repository<ScenarioLockEntity>,
    private readonly scenarioAclService: ScenarioAccessControl,
  ) {}

  async acquireLock(
    scenarioId: string,
    userId: string,
  ): Promise<Either<AcquireFailure | typeof forbiddenError, ScenarioLockDto>> {
    if (!(await this.scenarioAclService.canEditScenario(userId, scenarioId))) {
      return left(forbiddenError);
    }
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

  async releaseLock(scenarioId: string): Promise<void> {
    await this.locksRepo.delete({ scenarioId });
  }

  async isLocked(scenarioId: string): Promise<boolean> {
    return (await this.locksRepo.count({ where: { scenarioId } })) > 0;
  }

  async isLockedByUser(scenarioId: string, userId: string): Promise<boolean> {
    return !(await this.locksRepo.find({ where: { scenarioId, userId } }));
  }
}
