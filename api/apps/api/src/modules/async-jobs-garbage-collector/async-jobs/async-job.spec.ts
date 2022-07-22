import { ApiEventsService } from '@marxan-api/modules/api-events';
import { ApiEventByTopicAndKind } from '@marxan-api/modules/api-events/api-event.topic+kind.api.entity';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { FixtureType } from '@marxan/utils/tests/fixture-type';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { v4 } from 'uuid';
import { AsyncJob } from './async-job';

let fixtures: FixtureType<typeof getFixtures>;

beforeEach(async () => {
  fixtures = await getFixtures();
});

it(`does not send a failed api event when async job has not started`, async () => {
  fixtures.GivenAsyncJobHasNotStarted();
  await fixtures.WhenSendingFailedApiEventForStuckAsyncJob();
  fixtures.ThenNoApiEventHasBeenSent();
});

it(`does not send a failed api event for a finished async job`, async () => {
  fixtures.GivenAsyncJobHasFinished();
  await fixtures.WhenSendingFailedApiEventForStuckAsyncJob();
  fixtures.ThenNoApiEventHasBeenSent();
});

it(`does not send a failed api event for a non stuck async job`, async () => {
  fixtures.GivenAsyncJobHasNotFinished({ isStuck: false });
  await fixtures.WhenSendingFailedApiEventForStuckAsyncJob();
  fixtures.ThenNoApiEventHasBeenSent();
});

it(`sends a failed api event for a stuck async job`, async () => {
  fixtures.GivenAsyncJobHasNotFinished({ isStuck: true });
  await fixtures.WhenSendingFailedApiEventForStuckAsyncJob();
  fixtures.ThenApiEventHasBeenSent();
});

const getFixtures = async () => {
  const getLatestEventForTopicMock = jest.fn();
  const createIfNotExistsMock = jest.fn();
  const sandbox = await Test.createTestingModule({
    imports: [],
    providers: [
      AsyncJobFake,
      {
        provide: ApiEventsService,
        useValue: {
          getLatestEventForTopic: getLatestEventForTopicMock,
          createIfNotExists: createIfNotExistsMock,
        },
      },
    ],
  }).compile();

  await sandbox.init();

  const projectId = v4();

  const sut = sandbox.get(AsyncJobFake);

  function subtract2HoursFromNow() {
    const date = new Date();
    date.setHours(date.getHours() - 2);
    return date;
  }

  const finishedApiEvent = API_EVENT_KINDS.project__grid__finished__v1__alpha;
  const workingApiEvent = API_EVENT_KINDS.project__grid__submitted__v1__alpha;
  const failedApiEvent = API_EVENT_KINDS.project__grid__failed__v1__alpha;

  return {
    GivenAsyncJobHasNotStarted: () => {
      getLatestEventForTopicMock.mockImplementation(async () => {
        throw new NotFoundException();
      });
    },
    GivenAsyncJobHasFinished: () => {
      getLatestEventForTopicMock.mockImplementation(async () => {
        return {
          topic: projectId,
          kind: finishedApiEvent,
          timestamp: new Date(),
        };
      });
    },
    GivenAsyncJobHasNotFinished: (opts: { isStuck: boolean }) => {
      const apiEventDate = opts.isStuck ? new Date(2022, 1, 1) : new Date();
      sut.maxHoursForAsyncJob = 2;
      getLatestEventForTopicMock.mockImplementation(async () => {
        return {
          topic: projectId,
          kind: workingApiEvent,
          timestamp: apiEventDate,
        };
      });
    },
    WhenSendingFailedApiEventForStuckAsyncJob: () =>
      sut.sendFailedApiEventForStuckAsyncJob(projectId),
    ThenApiEventHasBeenSent: () => {
      expect(createIfNotExistsMock).toHaveBeenCalled();
      expect(createIfNotExistsMock).toHaveBeenCalledWith({
        topic: projectId,
        kind: failedApiEvent,
      });
    },
    ThenNoApiEventHasBeenSent: () => {
      expect(createIfNotExistsMock).not.toHaveBeenCalled();
    },
  };
};

@Injectable()
class AsyncJobFake extends AsyncJob {
  public allAsyncJobStates: API_EVENT_KINDS[] = [];
  public endAsyncJobStates: API_EVENT_KINDS[] = [
    API_EVENT_KINDS.project__grid__finished__v1__alpha,
  ];
  public failedAsyncJob = API_EVENT_KINDS.project__grid__failed__v1__alpha;
  public maxHoursForAsyncJob = 0;
  protected getAllAsyncJobStates(): API_EVENT_KINDS[] {
    return this.allAsyncJobStates;
  }
  protected getEndAsyncJobStates(): API_EVENT_KINDS[] {
    return this.endAsyncJobStates;
  }
  protected getFailedAsyncJobState(
    stuckState: API_EVENT_KINDS,
  ): API_EVENT_KINDS {
    return this.failedAsyncJob;
  }
  protected getMaxHoursForAsyncJob(): number {
    return this.maxHoursForAsyncJob;
  }
}
