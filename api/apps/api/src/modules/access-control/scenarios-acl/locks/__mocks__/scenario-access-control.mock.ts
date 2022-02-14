import { forbiddenError } from '@marxan-api/modules/access-control';
import { Permit } from '@marxan-api/modules/access-control/access-control.types';
import { ScenarioAccessControl } from '@marxan-api/modules/access-control/scenarios-acl/scenario-access-control';
import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/lib/Either';
import {
  ScenarioLockDto,
  ScenarioLockResultSingular,
} from '@marxan-api/modules/access-control/scenarios-acl/locks/dto/scenario.lock.dto';
import {
  AcquireFailure,
  lockedByAnotherUser,
  lockedScenario,
  noLockInPlace,
} from '../lock.service';

@Injectable()
export class ScenarioAccessControlMock implements ScenarioAccessControl {
  mock: jest.Mock<boolean> = jest.fn(() => true);

  async canCreateScenario(userId: string, projectId: string): Promise<Permit> {
    return this.mock(userId, projectId);
  }
  async canEditScenario(userId: string, projectId: string): Promise<Permit> {
    return this.mock(userId, projectId);
  }
  async canViewScenario(userId: string, projectId: string): Promise<Permit> {
    return this.mock(userId, projectId);
  }
  async canDeleteScenario(userId: string, projectId: string): Promise<Permit> {
    return this.mock(userId, projectId);
  }
  async canCloneScenario(userId: string, scenarioId: string): Promise<Permit> {
    return this.mock(userId, scenarioId);
  }
  async canReleaseLock(userId: string, scenarioId: string): Promise<Permit> {
    return this.mock(userId, scenarioId);
  }
  async acquireLock(
    userId: string,
    scenarioId: string,
  ): Promise<Either<typeof forbiddenError | AcquireFailure, ScenarioLockDto>> {
    if (this.mock(userId, scenarioId)) {
      return left(lockedScenario);
    }
    if (this.mock(userId, scenarioId)) {
      return left(forbiddenError);
    }
    return right({ userId, scenarioId, createdAt: new Date() });
  }
  async releaseLock(
    userId: string,
    scenarioId: string,
    projectId: string,
  ): Promise<Either<typeof forbiddenError | typeof lockedByAnotherUser, void>> {
    if (this.mock(userId, scenarioId)) {
      return left(forbiddenError);
    }
    return right(void 0);
  }
  async canEditScenarioAndOwnsLock(
    userId: string,
    scenarioId: string,
  ): Promise<
    Either<
      typeof forbiddenError | typeof lockedByAnotherUser | typeof noLockInPlace,
      boolean
    >
  > {
    if (this.mock(userId, scenarioId)) {
      return left(forbiddenError);
    }
    return right(this.mock(userId, scenarioId));
  }
  async findLock(
    userId: string,
    scenarioId: string,
  ): Promise<Either<typeof forbiddenError, ScenarioLockResultSingular>> {
    if (this.mock(userId, scenarioId)) {
      return left(forbiddenError);
    }

    return right({ data: { userId, scenarioId, createdAt: new Date() } });
  }
}
