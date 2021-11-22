import { Command } from '@nestjs-architects/typed-cqrs';

export class CollectGarbage extends Command<void> {
  constructor(public readonly id: string, public readonly projectId: string) {
    super();
  }
}
