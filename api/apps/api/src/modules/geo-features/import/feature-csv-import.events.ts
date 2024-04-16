import { ApiEventsService } from '@marxan-api/modules/api-events';
import { Injectable } from '@nestjs/common';
import { API_EVENT_KINDS } from '@marxan/api-events';

// @todo: Refactor this once we design the uniform solution for events management
@Injectable()
export class FeatureCSVImportEventsService {
  eventId!: string;

  submit = () =>
    API_EVENT_KINDS.project__features__csv__import__submitted__v1__alpha;
  finish = () =>
    API_EVENT_KINDS.project__features__csv__import__finished__v1__alpha;
  fail = () =>
    API_EVENT_KINDS.project__features__csv__import__failed__v1__alpha;

  constructor(private readonly apiEvents: ApiEventsService) {}

  async submittedEvent(topic: string, data: any) {
    await this.apiEvents.create({ topic, kind: this.submit(), data });
  }

  async finishEvent(topic: string) {
    await this.apiEvents.create({ topic, kind: this.finish() });
  }

  async failEvent(topic: string, data: any) {
    await this.apiEvents.create({ topic, kind: this.fail(), data: data });
  }
}
