import { IEvent } from '@nestjs/cqrs';

export class UserLoggedIn implements IEvent {
  constructor(public readonly userId: string) {}
}
