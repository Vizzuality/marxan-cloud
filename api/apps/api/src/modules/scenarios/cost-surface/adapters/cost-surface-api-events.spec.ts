import { ApiEvent } from '@marxan-api/modules/api-events/api-event.api.entity';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { fakeQueryBuilder } from '../../../../utils/__mocks__/fake-query-builder';
import { LatestApiEventByTopicAndKind } from '../../../api-events/api-event.topic+kind.api.entity';
import { CostSurfaceState } from '../ports/cost-surface-events.port';
import { CostSurfaceApiEvents } from './cost-surface-api-events';

const scenarioId = 'scenario-uuid';
const cases: [CostSurfaceState, API_EVENT_KINDS][] = [
  [
    CostSurfaceState.Submitted,
    API_EVENT_KINDS.scenario__costSurface__submitted__v1_alpha1,
  ],
  [
    CostSurfaceState.ShapefileConverted,
    API_EVENT_KINDS.scenario__costSurface__shapeConverted__v1_alpha1,
  ],
  [
    CostSurfaceState.ShapefileConversionFailed,
    API_EVENT_KINDS.scenario__costSurface__shapeConversionFailed__v1_alpha1,
  ],
  [
    CostSurfaceState.CostUpdateFailed,
    API_EVENT_KINDS.scenario__costSurface__costUpdateFailed__v1_alpha1,
  ],
  [
    CostSurfaceState.Finished,
    API_EVENT_KINDS.scenario__costSurface__finished__v1_alpha1,
  ],
];

let sut: CostSurfaceApiEvents;
let repoMock: jest.Mocked<Repository<ApiEvent>>;

beforeEach(async () => {
  const apiEventsToken = getRepositoryToken(ApiEvent);
  const sandbox = await Test.createTestingModule({
    providers: [
      CostSurfaceApiEvents,
      {
        provide: apiEventsToken,
        useValue: {
          metadata: {
            name: 'required-by-base-service-for-logging',
          },
          createQueryBuilder: () => fakeQueryBuilder(jest.fn()),
          save: jest.fn().mockResolvedValue({}),
        },
      },
      {
        provide: getRepositoryToken(LatestApiEventByTopicAndKind),
        useValue: jest.fn(),
      },
    ],
  }).compile();

  sut = sandbox.get(CostSurfaceApiEvents);
  repoMock = sandbox.get(apiEventsToken);
});

test.each(cases)(`emits %p as %p`, async (event, kind) => {
  await sut.event(scenarioId, event);
  expect(repoMock.save.mock.calls[0][0]).toEqual({
    data: {},
    topic: scenarioId,
    kind,
  });
});
