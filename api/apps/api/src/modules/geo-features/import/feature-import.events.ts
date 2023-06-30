import { ApiEventsService } from '@marxan-api/modules/api-events';
import { Injectable } from '@nestjs/common';
import { API_EVENT_KINDS } from '@marxan/api-events';

// @todo: Refactor this once we design the uniform solution for events management
@Injectable()
export class FeatureImportEventsService {
  eventId!: string;

  submit = () => API_EVENT_KINDS.features__csv__import__submitted__v1__alpha;
  finish = () => API_EVENT_KINDS.features__csv__import__finished__v1__alpha;
  fail = () => API_EVENT_KINDS.features__csv__import__failed__v1__alpha;

  constructor(private readonly apiEvents: ApiEventsService) {}

  async createEvent(data: any) {
    this.eventId = await this.apiEvents
      .create({
        kind: this.submit(),
        topic: data.userId,
      })
      .then(({ id }) => id);
  }

  async finishEvent() {
    await this.apiEvents.update(this.eventId, {
      kind: this.finish(),
    });
  }

  async failEvent(data: any) {
    await this.apiEvents.update(this.eventId, {
      kind: this.fail(),
      data: data,
    });
  }
}
