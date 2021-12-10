import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Either, left, right } from 'fp-ts/Either';

import { FixtureType } from '@marxan/utils/tests/fixture-type';
import {
  AcquireFailure,
  lockedScenario,
  lockNotFoundError,
  LockService,
  ReleaseFailure,
} from './lock.service';
import { ScenarioLockEntity } from './scenario.lock.entity';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it(`should be able to grab lock if lock is available`, async () => {
  await fixtures.GivenLockForScenarioIsNotFound();
  const lock = await fixtures.WhenAcquiringALock();
  await fixtures.ThenScenarioIsLocked(lock);
});

it(`should not be able to grab lock if lock is not available`, async () => {
  await fixtures.GivenLockForScenarioIsFound();
  const lock = await fixtures.WhenAcquiringALock();
  await fixtures.ThenALockedScenarioErrorIsReturned(lock);
});

it(`should be able to release the lock if lock exists`, async () => {
  await fixtures.GivenLockForScenarioIsFound();
  const lock = await fixtures.WhenSameUserReleasesTheLock();
  await fixtures.ThenScenarioIsNotLocked(lock);
});

it(`should not be able to release the lock if lock exists for a different user`, async () => {
  await fixtures.GivenLockForScenarioIsNotFound();
  const lock = await fixtures.WhenDifferentUserReleasesTheLock();
  await fixtures.ThenScenarioIsStillLocked(lock);
});

it(`should not be able to release the lock if lock does not exist`, async () => {
  await fixtures.GivenLockForScenarioIsNotFound();
  const lock = await fixtures.WhenSameUserReleasesTheLock();
  await fixtures.ThenALockNotFoundErrorIsReturned(lock);
});

it(`isLocked should return true if a lock exists`, async () => {
  await fixtures.GivenCountOfLocksForScenarioIsNotZero();
  const result = await fixtures.WhenCheckingIfAScenarioIsLocked();
  await fixtures.ThenIsLockedReturnsTrue(result);
});

it(`isLocked should return false if lock no lock exists`, async () => {
  await fixtures.GivenCountOfLocksForScenarioIsZero();
  const result = await fixtures.WhenCheckingIfAScenarioIsLocked();
  await fixtures.ThenIsLockedReturnsFalse(result);
});

async function getFixtures() {
  const USER_ID = 'user-id';
  const SCENARIO_ID = 'scenario-id';

  const mockEntityManager = {
    find: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const sandbox = await Test.createTestingModule({
    providers: [
      LockService,
      {
        provide: getRepositoryToken(ScenarioLockEntity),
        useValue: {
          manager: {
            transaction: (fn: (em: Partial<EntityManager>) => Promise<void>) =>
              fn(mockEntityManager),
          },
          find: jest.fn(),
          count: jest.fn(),
        },
      },
    ],
  })
    .compile()
    .catch((error) => {
      console.log(error);
      throw error;
    });

  const sut = sandbox.get(LockService);
  const locksRepoMock = sandbox.get(getRepositoryToken(ScenarioLockEntity));

  return {
    GivenLockForScenarioIsNotFound: async () => {
      mockEntityManager.find.mockImplementationOnce(async () => []);
    },
    GivenLockForScenarioIsFound: async () => {
      mockEntityManager.find.mockImplementationOnce(async () => [
        {
          scenarioId: SCENARIO_ID,
          userId: USER_ID,
          createdAt: new Date(),
        },
      ]);
    },
    GivenCountOfLocksForScenarioIsZero: async () => {
      locksRepoMock.count.mockImplementationOnce(async () => 0);
    },
    GivenCountOfLocksForScenarioIsNotZero: async () => {
      locksRepoMock.count.mockImplementationOnce(async () => 1);
    },

    WhenAcquiringALock: async () => sut.acquireLock(SCENARIO_ID, USER_ID),
    WhenSameUserReleasesTheLock: async () =>
      sut.releaseLock(SCENARIO_ID, USER_ID),
    WhenDifferentUserReleasesTheLock: async () =>
      sut.releaseLock(SCENARIO_ID, 'other-user'),
    WhenCheckingIfAScenarioIsLocked: async () => sut.isLocked(SCENARIO_ID),

    ThenScenarioIsLocked: async (result: Either<AcquireFailure, void>) => {
      expect(result).toStrictEqual(right(void 0));

      expect(mockEntityManager.find).toHaveBeenCalledWith(ScenarioLockEntity, {
        where: { scenarioId: SCENARIO_ID, userId: USER_ID },
      });

      expect(mockEntityManager.save).toHaveBeenCalledWith({
        scenarioId: SCENARIO_ID,
        userId: USER_ID,
        createdAt: expect.any(Date),
      });
    },
    ThenALockedScenarioErrorIsReturned: async (
      result: Either<AcquireFailure, void>,
    ) => {
      expect(result).toStrictEqual(left(lockedScenario));

      expect(mockEntityManager.find).toHaveBeenCalledWith(ScenarioLockEntity, {
        where: { scenarioId: SCENARIO_ID, userId: USER_ID },
      });
      expect(mockEntityManager.save).not.toHaveBeenCalled();
    },
    ThenIsLockedReturnsTrue: async (isLockedResult: boolean) => {
      expect(isLockedResult).toEqual(true);
      expect(locksRepoMock.count).toHaveBeenCalledWith({
        where: { scenarioId: SCENARIO_ID },
      });
    },
    ThenIsLockedReturnsFalse: async (isLockedResult: boolean) => {
      expect(isLockedResult).toEqual(false);
      expect(locksRepoMock.count).toHaveBeenCalledWith({
        where: { scenarioId: SCENARIO_ID },
      });
    },
    ThenScenarioIsNotLocked: async (result: Either<ReleaseFailure, void>) => {
      expect(result).toStrictEqual(right(void 0));
      expect(mockEntityManager.find).toHaveBeenCalledWith(ScenarioLockEntity, {
        where: { scenarioId: SCENARIO_ID, userId: USER_ID },
      });
      expect(mockEntityManager.remove).toHaveBeenCalledTimes(1);
    },
    ThenScenarioIsStillLocked: async (result: Either<ReleaseFailure, void>) => {
      expect(result).toStrictEqual(left(lockNotFoundError));
      expect(mockEntityManager.find).toHaveBeenCalledWith(ScenarioLockEntity, {
        where: { scenarioId: SCENARIO_ID, userId: 'other-user' },
      });
      expect(mockEntityManager.remove).toHaveBeenCalledTimes(0);
    },
    ThenALockNotFoundErrorIsReturned: async (
      result: Either<ReleaseFailure, void>,
    ) => {
      expect(result).toStrictEqual(left(lockNotFoundError));
      expect(mockEntityManager.find).toHaveBeenCalledWith(ScenarioLockEntity, {
        where: { scenarioId: SCENARIO_ID, userId: USER_ID },
      });
      expect(mockEntityManager.remove).toHaveBeenCalledTimes(0);
    },
  };
}
