import { Command } from '@nestjs-architects/typed-cqrs';

export class GarbageCollectAsyncJobs extends Command<void> {
  constructor(public readonly userId: string) {
    super();
  }
}
