import { Command } from '@nestjs-architects/typed-cqrs';

export class SetProjectBlm extends Command<void> {
  constructor(public readonly projectId: string) {
    super();
  }
}
