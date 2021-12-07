import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
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

  const mockConnection = () => ({
    createQueryRunner: () => ({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      release: jest.fn(),
      rollbackTransaction: jest.fn(),
    }),
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
        useValue: {
          findOne: jest.fn(),
          save: jest.fn(),
          remove: jest.fn(),
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
  const locksRepoMock: jest.Mocked<
    Repository<ScenarioLockEntity>
  > = sandbox.get(getRepositoryToken(ScenarioLockEntity));

  return {
    GivenNoLockHasBeenGrabbed: async () => {
      locksRepoMock.findOne.mockImplementationOnce(async () => undefined);
    },
    GivenALockHasBeenGrabbed: async () => {
      locksRepoMock.findOne.mockImplementationOnce(async () => ({
        scenarioId: fakeScenario.id,
        userId: fakeUser.id,
        grabDate: new Date(),
      }));
    },
    ThenShouldBeAbleToGrabNewLockForGivenScenario: async () => {
      const mockDate = new Date('2021-02-26T22:42:16.652Z');
      const spy = jest
        .spyOn(global, 'Date')
        .mockImplementation(() => (mockDate as unknown) as string);

      await expect(
        sut.grabLock(fakeScenario.id, fakeUser.id),
      ).resolves.not.toThrow();

      expect(locksRepoMock.findOne).toHaveBeenCalledWith({
        where: { scenarioId: fakeScenario.id, userId: fakeUser.id },
      });

      expect(locksRepoMock.save).toHaveBeenCalledWith({
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
        sut.grabLock(fakeScenario.id, fakeUser.id),
      ).rejects.toThrowError(new LockedScenarioError());

      expect(locksRepoMock.findOne).toHaveBeenCalledWith({
        where: { scenarioId: fakeScenario.id, userId: fakeUser.id },
      });
      expect(locksRepoMock.save).not.toHaveBeenCalled();

      spy.mockRestore();
    },
    ThenIsLockedReturnsTrue: async () => {
      await expect(sut.isLocked(fakeScenario.id)).resolves.toBeTruthy();
      expect(locksRepoMock.findOne).toHaveBeenCalledWith({
        where: { scenarioId: fakeScenario.id },
      });
    },
    ThenIsLockedReturnsFalse: async () => {
      await expect(sut.isLocked(fakeScenario.id)).resolves.toBeFalsy();
      expect(locksRepoMock.findOne).toHaveBeenCalledWith({
        where: { scenarioId: fakeScenario.id },
      });
    },
    ThenSameUserShouldBeAbleToReleaseLock: async () => {
      await expect(
        sut.releaseLock(fakeScenario.id, fakeUser.id),
      ).resolves.not.toThrow();

      expect(locksRepoMock.findOne).toHaveBeenCalledWith({
        where: { scenarioId: fakeScenario.id, userId: fakeUser.id },
      });
      expect(locksRepoMock.remove).toHaveBeenCalledTimes(1);
    },
    ThenOtherUserShouldNotBeAbleToReleaseLock: async () => {
      await expect(
        sut.releaseLock(fakeScenario.id, 'other-user'),
      ).rejects.toThrowError(new LockNotFoundError());

      expect(locksRepoMock.findOne).toHaveBeenCalledWith({
        where: { scenarioId: fakeScenario.id, userId: 'other-user' },
      });
      expect(locksRepoMock.remove).toHaveBeenCalledTimes(0);
    },
    ThenShouldNotBeAbleToReleaseLock: async () => {
      await expect(
        sut.releaseLock(fakeScenario.id, fakeUser.id),
      ).rejects.toThrowError(new LockNotFoundError());

      expect(locksRepoMock.findOne).toHaveBeenCalledWith({
        where: { scenarioId: fakeScenario.id, userId: fakeUser.id },
      });
      expect(locksRepoMock.remove).toHaveBeenCalledTimes(0);
    },
  };
}
