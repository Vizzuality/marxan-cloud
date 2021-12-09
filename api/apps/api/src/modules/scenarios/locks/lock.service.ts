import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';

import { ScenarioLockEntity } from '@marxan-api/modules/scenarios/locks/scenario.lock.entity';
import { LockedScenarioError } from './errors/locked.scenario.error';
import { LockNotFoundError } from './errors/lock.not.found.error';

@Injectable()
export class LockService {
  constructor(
    @InjectRepository(ScenarioLockEntity)
    private readonly locksRepo: Repository<ScenarioLockEntity>,
    private connection: Connection,
  ) {}

  async acquireLock(scenarioId: string, userId: string): Promise<void> {
    return this.connection.transaction(async (entityManager) => {
      const existingLock = await entityManager.find(ScenarioLockEntity, {
        where: { scenarioId, userId },
      });

      if (existingLock.length > 0) {
        throw new LockedScenarioError();
      }

      await entityManager.save({
        scenarioId,
        userId,
        grabDate: new Date(),
      });
    });
  }

  async releaseLock(scenarioId: string, userId: string): Promise<void> {
    return this.connection.transaction(async (entityManager) => {
      const existingLock = await entityManager.find(ScenarioLockEntity, {
        where: { scenarioId, userId },
      });

      if (existingLock.length < 1) {
        throw new LockNotFoundError();
      }

      await entityManager.remove(existingLock[0]);
    });
  }

  async isLocked(scenarioId: string): Promise<boolean> {
    return this.connection.transaction(async (entityManager) => {
      const locks = await entityManager.find(ScenarioLockEntity, {
        where: { scenarioId },
      });

      return locks.length > 0;
    });
  }
}
