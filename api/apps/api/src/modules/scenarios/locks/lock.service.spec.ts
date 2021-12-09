import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection, EntityManager } from 'typeorm';
import * as faker from 'faker';

import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { LockService } from '@marxan-api/modules/scenarios/locks/lock.service';
import {
  JobStatus,
  Scenario,
  ScenarioType,
} from '@marxan-api/modules/scenarios/scenario.api.entity';
import { ScenarioLockEntity } from '@marxan-api/modules/scenarios/locks/scenario.lock.entity';
import { User } from '@marxan-api/modules/users/user.api.entity';
import { LockedScenarioError } from '@marxan-api/modules/scenarios/locks/errors/locked.scenario.error';
import { LockNotFoundError } from '@marxan-api/modules/scenarios/locks/errors/lock.not.found.error';

let fixtures: FixtureType<typeof getFixtures>;

describe('Lock service test suite', () => {
  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  it(`should be able to grab lock if lock is available`, async () => {
    await fixtures.GivenNoLockHasBeenGrabbed();
    await fixtures.ThenShouldBeAbleToGrabNewLockForGivenScenario();
  });

  it(`should not be able to grab lock if lock is not available`, async () => {
    await fixtures.GivenALockHasBeenGrabbed();
    await fixtures.ThenShouldNotBePossibleToGrabNewLockForGivenScenario();
  });

  it(`should be able to release the lock if lock exists`, async () => {
    await fixtures.GivenALockHasBeenGrabbed();
    await fixtures.ThenSameUserShouldBeAbleToReleaseLock();
  });

  it(`should not be able to release the lock if lock exists for a different user`, async () => {
    await fixtures.GivenNoLockHasBeenGrabbed();
    await fixtures.ThenOtherUserShouldNotBeAbleToReleaseLock();
  });

  it(`should not be able to release the lock if lock does not exist`, async () => {
    await fixtures.GivenNoLockHasBeenGrabbed();
    await fixtures.ThenShouldNotBeAbleToReleaseLock();
  });

  it(`isLocked should return true if lock is not available`, async () => {
    await fixtures.GivenALockHasBeenGrabbed();
    await fixtures.ThenIsLockedReturnsTrue();
  });

  it(`isLocked should return false if lock is available`, async () => {
    await fixtures.GivenNoLockHasBeenGrabbed();
    await fixtures.ThenIsLockedReturnsFalse();
  });
});

async function getFixtures() {
  const fakeUser: User = {
    id: 'fake-user',
    email: faker.internet.email(),
    passwordHash: faker.random.uuid(),
    isActive: true,
    isDeleted: false,
    projects: [],
    scenarios: [],
  };

  const fakeScenario: Scenario = {
    id: faker.random.uuid(),
    name: 'Scenario',
    type: ScenarioType.marxan,
    projectId: 'dummy',
    status: JobStatus.created,
    users: [],
    ranAtLeastOnce: true,
    createdAt: new Date(),
    createdByUser: fakeUser,
    createdBy: 'fake',
    lastModifiedAt: new Date(),
  };

  const mockEntityManager = {
    find: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockConnection = () => ({
    transaction: (fn: (em: Partial<EntityManager>) => Promise<void>) =>
      fn(mockEntityManager),
  });

  const sandbox = await Test.createTestingModule({
    providers: [
      LockService,
      {
        provide: Connection,
        useFactory: mockConnection,
      },
      {
        provide: getRepositoryToken(ScenarioLockEntity),
        useValue: {},
      },
    ],
  })
    .compile()
    .catch((error) => {
      console.log(error);
      throw error;
    });

  const sut = sandbox.get(LockService);

  return {
    GivenNoLockHasBeenGrabbed: async () => {
      mockEntityManager.find.mockImplementationOnce(async () => []);
    },
    GivenALockHasBeenGrabbed: async () => {
      mockEntityManager.find.mockImplementationOnce(async () => [
        {
          scenarioId: fakeScenario.id,
          userId: fakeUser.id,
          grabDate: new Date(),
        },
      ]);
    },
    ThenShouldBeAbleToGrabNewLockForGivenScenario: async () => {
      const mockDate = new Date('2021-02-26T22:42:16.652Z');
      const spy = jest
        .spyOn(global, 'Date')
        .mockImplementation(() => (mockDate as unknown) as string);

      await expect(
        sut.acquireLock(fakeScenario.id, fakeUser.id),
      ).resolves.not.toThrow();

      expect(mockEntityManager.find).toHaveBeenCalledWith(ScenarioLockEntity, {
        where: { scenarioId: fakeScenario.id, userId: fakeUser.id },
      });

      expect(mockEntityManager.save).toHaveBeenCalledWith({
        scenarioId: fakeScenario.id,
        userId: fakeUser.id,
        grabDate: mockDate,
      });

      spy.mockRestore();
    },
    ThenShouldNotBePossibleToGrabNewLockForGivenScenario: async () => {
      const mockDate = new Date('2021-02-26T22:42:16.652Z');
      const spy = jest
        .spyOn(global, 'Date')
        .mockImplementation(() => (mockDate as unknown) as string);

      await expect(
        sut.acquireLock(fakeScenario.id, fakeUser.id),
      ).rejects.toThrowError(new LockedScenarioError());

      expect(mockEntityManager.find).toHaveBeenCalledWith(ScenarioLockEntity, {
        where: { scenarioId: fakeScenario.id, userId: fakeUser.id },
      });
      expect(mockEntityManager.save).not.toHaveBeenCalled();

      spy.mockRestore();
    },
    ThenIsLockedReturnsTrue: async () => {
      await expect(sut.isLocked(fakeScenario.id)).resolves.toBeTruthy();
      expect(mockEntityManager.find).toHaveBeenCalledWith(ScenarioLockEntity, {
        where: { scenarioId: fakeScenario.id },
      });
    },
    ThenIsLockedReturnsFalse: async () => {
      await expect(sut.isLocked(fakeScenario.id)).resolves.toBeFalsy();
      expect(mockEntityManager.find).toHaveBeenCalledWith(ScenarioLockEntity, {
        where: { scenarioId: fakeScenario.id },
      });
    },
    ThenSameUserShouldBeAbleToReleaseLock: async () => {
      await expect(
        sut.releaseLock(fakeScenario.id, fakeUser.id),
      ).resolves.not.toThrow();

      expect(mockEntityManager.find).toHaveBeenCalledWith(ScenarioLockEntity, {
        where: { scenarioId: fakeScenario.id, userId: fakeUser.id },
      });
      expect(mockEntityManager.remove).toHaveBeenCalledTimes(1);
    },
    ThenOtherUserShouldNotBeAbleToReleaseLock: async () => {
      await expect(
        sut.releaseLock(fakeScenario.id, 'other-user'),
      ).rejects.toThrowError(new LockNotFoundError());

      expect(mockEntityManager.find).toHaveBeenCalledWith(ScenarioLockEntity, {
        where: { scenarioId: fakeScenario.id, userId: 'other-user' },
      });
      expect(mockEntityManager.remove).toHaveBeenCalledTimes(0);
    },
    ThenShouldNotBeAbleToReleaseLock: async () => {
      await expect(
        sut.releaseLock(fakeScenario.id, fakeUser.id),
      ).rejects.toThrowError(new LockNotFoundError());

      expect(mockEntityManager.find).toHaveBeenCalledWith(ScenarioLockEntity, {
        where: { scenarioId: fakeScenario.id, userId: fakeUser.id },
      });
      expect(mockEntityManager.remove).toHaveBeenCalledTimes(0);
    },
  };
}
