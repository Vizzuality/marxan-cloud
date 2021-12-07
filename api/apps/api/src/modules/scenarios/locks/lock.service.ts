import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';

import { ScenarioLockEntity } from '@marxan-api/modules/scenarios/locks/scenario.lock.entity';

import { LockedScenarioError } from './errors/locked.scenario.error';
import { LockNotFoundError } from './errors/lock.not.found.error';

@Injectable()
export class LockService {
  private apiQueryRunner;

  constructor(
    @InjectRepository(ScenarioLockEntity)
    private readonly locksRepo: Repository<ScenarioLockEntity>,
    private connection: Connection,
  ) {
    this.apiQueryRunner = this.connection.createQueryRunner();
  }

  private async startTransaction() {
    await this.apiQueryRunner.connect();
    await this.apiQueryRunner.startTransaction();
  }

  private async releaseTransaction() {
    await this.apiQueryRunner.release();
  }

  private async rollbackTransaction() {
    await this.apiQueryRunner.rollbackTransaction();
  }

  async grabLock(scenarioId: string, userId: string): Promise<void> {
    try {
      await this.startTransaction();
      const existingLock = await this.locksRepo.findOne({
        where: { scenarioId, userId },
      });

      if (existingLock) {
        throw new LockedScenarioError();
      }

      await this.locksRepo.save({
        scenarioId,
        userId,
        grabDate: new Date(),
      });
    } catch (err) {
      await this.rollbackTransaction();
      throw err;
    } finally {
      await this.releaseTransaction();
    }
  }

  async releaseLock(scenarioId: string, userId: string): Promise<void> {
    try {
      await this.startTransaction();
      const existingLock = await this.locksRepo.findOne({
        where: { scenarioId, userId },
      });

      if (!existingLock) {
        throw new LockNotFoundError();
      }

      await this.locksRepo.remove(existingLock);
    } catch (err) {
      await this.rollbackTransaction();
      throw err;
    } finally {
      await this.releaseTransaction();
    }
  }

  async isLocked(scenarioId: string): Promise<boolean> {
    const lock = await this.locksRepo.findOne({
      where: { scenarioId },
    });

    return !!lock;
  }
}
