import { ApiEventsService } from '@marxan-api/modules/api-events';
import { Injectable } from '@nestjs/common';
import { API_EVENT_KINDS } from '@marxan/api-events';

@Injectable()
export class FeatureImportEventsService {
  eventId!: string;

  submit = () => API_EVENT_KINDS.features__csv__import__submitted__v1__alpha;
  finish = () => API_EVENT_KINDS.features__csv__import__finished__v1__alpha;
  fail = () => API_EVENT_KINDS.features__csv__import__failed__v1__alpha;

  constructor(private readonly apiEvents: ApiEventsService) {}

  async registerEvent(event: API_EVENT_KINDS, data: any) {
    if (event === this.submit() || !this.eventId) {
      this.eventId = await this.apiEvents
        .create({
          kind: event,
          topic: data.userId,
        })
        .then(({ id }) => id);
    }
    if (event === this.finish())
      await this.apiEvents.update(this.eventId, {
        kind: event,
      });
    if (event === this.fail())
      await this.apiEvents.update(this.eventId, {
        kind: event,
        data: data,
      });
  }
}
