import { IEvent } from '@nestjs/cqrs';
import { API_EVENT_KINDS } from './events.enum';

export class ApiEvent<T extends Record<string, unknown>> implements IEvent {
  constructor(
    public readonly resourceId: string,
    public readonly kind: API_EVENT_KINDS,
    public readonly data?: T,
  ) {}
}
