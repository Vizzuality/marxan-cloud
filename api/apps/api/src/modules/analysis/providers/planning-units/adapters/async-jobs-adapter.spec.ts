import { Test } from '@nestjs/testing';
import { Queue } from 'bullmq';
import { QueueService } from '../../../../queue/queue.service';
import { AsyncJobsAdapter } from './async-jobs-adapter';
import { RequestJobInput } from '../request-job.port';

let sut: AsyncJobsAdapter;
let addJobMock: jest.SpyInstance;

beforeEach(async () => {
  addJobMock = jest.fn();
  const sandbox = await Test.createTestingModule({
    providers: [
      {
        provide: QueueService,
        useValue: ({
          queue: ({
            add: addJobMock,
          } as unknown) as Queue,
        } as unknown) as QueueService<RequestJobInput>,
      },
      AsyncJobsAdapter,
    ],
  }).compile();

  sut = sandbox.get(AsyncJobsAdapter);
});

describe(`when requesting job`, () => {
  it(`should proxy data to queue`, async () => {
    const outcome = await sut.queue({
      scenarioId: `scenarioId`,
      include: {
        pu: ['uuid'],
      },
    });

    expect(outcome).toEqual({
      id: 'scenarioId',
      status: 'running',
    });

    expect(addJobMock.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "calculate-planning-units-geo-update-scenarioId",
          Object {
            "include": Object {
              "pu": Array [
                "uuid",
              ],
            },
            "scenarioId": "scenarioId",
          },
        ],
      ]
    `);
  });
});
