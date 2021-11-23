import { Test } from '@nestjs/testing';
import { ApiEventsService } from '@marxan-api/modules/api-events';

import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { queueToken } from './planning-units-queue.provider';
import { PlanningUnitsService } from './planning-units.service';
import { API_EVENT_KINDS } from '@marxan/api-events';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

test(`submitting job fails`, async () => {
  fixtures.GivenQueueIsDown();
  await fixtures.WhenSubmittingPuJob();
  fixtures.ThenEventIsNotCreated();
});

test(`submitting job succeeds`, async () => {
  await fixtures.WhenSubmittingPuJob();
  fixtures.ThenJobIsQueued();
  fixtures.ThenSubmittedEventIsCreated();
});

const getFixtures = async () => {
  const fakeQueue = {
    add: jest.fn().mockImplementation(async () => ({
      id: '1',
    })),
  };
  const fakeEvents = {
    create: jest.fn(),
  };
  const sandbox = await Test.createTestingModule({
    providers: [
      {
        provide: queueToken,
        useValue: fakeQueue,
      },
      {
        provide: ApiEventsService,
        useValue: fakeEvents,
      },

      PlanningUnitsService,
    ],
  }).compile();
  const sut = sandbox.get(PlanningUnitsService);
  return {
    GivenQueueIsDown() {
      fakeQueue.add.mockImplementationOnce(async () => void 0);
    },
    async WhenSubmittingPuJob() {
      await sut.create({ projectId: '1' } as any);
    },
    ThenEventIsNotCreated() {
      expect(fakeEvents.create).not.toHaveBeenCalled();
    },
    ThenSubmittedEventIsCreated() {
      expect(fakeEvents.create).toHaveBeenCalledWith({
        kind: API_EVENT_KINDS.project__planningUnits__submitted__v1__alpha,
        topic: '1',
      });
    },
    ThenJobIsQueued() {
      expect(fakeQueue.add.mock.calls[0]).toEqual([
        `create-regular-pu`,
        {
          projectId: '1',
        },
      ]);
    },
  };
};
