import { INestApplication } from '@nestjs/common';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ApiEvent } from '@marxan-api/modules/api-events/api-event.api.entity';

export const GivenApiEvent = async (
  app: INestApplication,
  resourceId: string,
  event: API_EVENT_KINDS,
  payload?: Record<string, unknown>,
) => {
  const repo: Repository<ApiEvent> = app.get(getRepositoryToken(ApiEvent));
  await repo.save(
    repo.create({
      data: payload,
      timestamp: new Date(),
      kind: event,
      topic: resourceId,
    }),
  );
};
