import { Test } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { v4 } from 'uuid';

import { ProtectedAreaUnlinked } from '@marxan-api/modules/scenarios/protected-area';

import { CleanupModule } from './cleanup.module';
import { CollectGarbageHandler } from './collect-garbage.handler';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { CollectGarbage } from './collect-garbage.command';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`triggering garbage collector`, async () => {
  await fixtures.WhenPuUnlinkedEventIsEmitted();
  await fixtures.ThenGarbageCollectorRan();
});

const getFixtures = async () => {
  const sandbox = await Test.createTestingModule({
    imports: [CleanupModule],
  }).compile();
  await sandbox.init();

  const projectId = v4();
  const protectedAreaId = v4();

  const sut = sandbox.get(CollectGarbageHandler);
  const eventBus = sandbox.get(EventBus);
  const executeMock = jest
    .spyOn(sut, 'execute')
    .mockImplementation(async () => {
      // no-op
    });

  return {
    WhenPuUnlinkedEventIsEmitted: async () => {
      eventBus.publish(new ProtectedAreaUnlinked(protectedAreaId, projectId));
    },
    ThenGarbageCollectorRan: () => {
      expect(executeMock).toHaveBeenCalledWith(
        new CollectGarbage(protectedAreaId, projectId),
      );
    },
  };
};
