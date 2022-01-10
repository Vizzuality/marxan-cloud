import { Command } from '@nestjs-architects/typed-cqrs';

export class CancelBlmCalibration extends Command<void> {
  constructor(public readonly scenarioId: string) {
    super();
  }
}
