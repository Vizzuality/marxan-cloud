import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Either, left, right } from 'fp-ts/lib/Either';

import { ScenarioLockEntity } from '@marxan-api/modules/scenarios/locks/scenario.lock.entity';

export const unknownError = Symbol(`unknown error`);
export const lockNotFoundError = Symbol(`lock not found`);
export const lockedScenario = Symbol(`scenario is already locked`);

export type AcquireFailure = typeof unknownError | typeof lockedScenario;
export type ReleaseFailure = typeof unknownError | typeof lockNotFoundError;

@Injectable()
export class LockService {
  constructor(
    @InjectRepository(ScenarioLockEntity)
    private readonly locksRepo: Repository<ScenarioLockEntity>,
    private connection: Connection,
  ) {}

  async acquireLock(
    scenarioId: string,
    userId: string,
  ): Promise<Either<AcquireFailure, void>> {
    return this.connection.transaction(async (entityManager) => {
      const existingLock = await entityManager.find(ScenarioLockEntity, {
        where: { scenarioId, userId },
      });

      if (existingLock.length > 0) {
        return left(lockedScenario);
      }

      await entityManager.save({
        scenarioId,
        userId,
        grabDate: new Date(),
      });

      return right(void 0);
    });
  }

  async releaseLock(
    scenarioId: string,
    userId: string,
  ): Promise<Either<ReleaseFailure, void>> {
    return this.connection.transaction(async (entityManager) => {
      const existingLock = await entityManager.find(ScenarioLockEntity, {
        where: { scenarioId, userId },
      });

      if (existingLock.length < 1) {
        return left(lockNotFoundError);
      }

      await entityManager.remove(existingLock[0]);

      return right(void 0);
    });
  }

  async isLocked(scenarioId: string): Promise<boolean> {
    const locks = await this.locksRepo.find({
      where: { scenarioId },
    });

    return locks.length > 0;
  }
}
