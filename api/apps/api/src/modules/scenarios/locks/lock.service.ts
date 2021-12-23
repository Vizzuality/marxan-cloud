import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Either, left, right } from 'fp-ts/lib/Either';

import { ScenarioLockEntity } from '@marxan-api/modules/scenarios/locks/scenario.lock.entity';

export const unknownError = Symbol(`unknown error`);
export const lockedScenario = Symbol(`scenario is already locked`);

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
  ): Promise<Either<AcquireFailure, void>> {
    return this.locksRepo.manager.transaction(async (entityManager) => {
      if (await this.isLocked(scenarioId)) {
        return left(lockedScenario);
      }

      await entityManager.save({
        scenarioId,
        userId,
        createdAt: new Date(),
      });

      return right(void 0);
    });
  }

  async releaseLock(scenarioId: string): Promise<void> {
    await this.locksRepo.delete({ scenarioId });
  }

  async isLocked(scenarioId: string): Promise<boolean> {
    return (await this.locksRepo.count({ where: { scenarioId } })) > 0;
  }
}
