import { IEvent } from '@nestjs/cqrs';

export class ProtectedAreaUnlinked implements IEvent {
  constructor(public readonly id: string, public readonly projectId: string) {}
}
