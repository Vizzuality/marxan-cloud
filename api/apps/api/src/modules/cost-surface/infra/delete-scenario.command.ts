import { Command } from '@nestjs-architects/typed-cqrs';

export class DeleteScenario extends Command<void> {
  constructor(public readonly scenarioId: string) {
    super();
  }
}
