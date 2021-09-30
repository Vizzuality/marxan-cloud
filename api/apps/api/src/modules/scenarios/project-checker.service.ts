import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';

import { API_EVENT_KINDS } from '@marxan/api-events';
import { ApiEventsService } from '@marxan-api/modules/api-events';

@Injectable()
export class ProjectChecker {
  constructor(private readonly apiEvents: ApiEventsService) {}

  async isProjectReady(projectId: string): Promise<boolean> {
    const event = await this.apiEvents.getLatestEventForTopic({
      topic: projectId,
      kind: In([
        API_EVENT_KINDS.project__planningUnits__failed__v1__alpha,
        API_EVENT_KINDS.project__planningUnits__finished__v1__alpha,
        API_EVENT_KINDS.project__planningUnits__submitted__v1__alpha,
      ]),
    });
    return (
      event?.kind ===
      API_EVENT_KINDS.project__planningUnits__finished__v1__alpha
    );
  }
}
