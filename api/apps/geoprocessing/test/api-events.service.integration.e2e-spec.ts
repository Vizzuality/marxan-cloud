import { Test } from '@nestjs/testing';
import { API_EVENT_KINDS } from '@marxan/api-events';
import AxiosMockAdapter from 'axios-mock-adapter';
import Axios from 'axios';
import { HttpService } from '@nestjs/axios';
import { ApiEventsService } from '../src/modules/api-events/api-events.service';
import * as config from 'config';

let sut: ApiEventsService;
let axiosMock: AxiosMockAdapter;

const axios = Axios.create();

beforeEach(async () => {
  axiosMock = new AxiosMockAdapter(axios, {
    onNoMatch: 'throwException',
  });
  const sandbox = await Test.createTestingModule({
    providers: [
      {
        provide: `AXIOS_INSTANCE_TOKEN`,
        useValue: axios,
      },
      HttpService,
      ApiEventsService,
    ],
  }).compile();
  sut = await sandbox.get(ApiEventsService);
});

describe(`when creating an event succeed`, () => {
  const resourceId = `resource-id`;
  const data = {
    payload: 'value',
  } as const;
  const kind = API_EVENT_KINDS.user__accountActivationTokenGenerated__v1alpha1;

  beforeEach(() => {
    axiosMock
      .onPost(config.get('api.url') + `/api/v1/api-events`, {
        kind: 'user.accountActivationTokenGenerated/v1alpha1',
        topic: resourceId,
        data: JSON.stringify(data),
      })
      .replyOnce(201, {});
  });

  it(`should submit the required data`, async () => {
    await sut.create(resourceId, kind, data);
    expect(axiosMock.history.post.length).toEqual(1);
  });
});
