import { Command } from '@nestjs-architects/typed-cqrs';

export class RemovePreviousCalibrationPartialResults extends Command<void> {
  constructor(
    public readonly scenarioId: string,
    public readonly currentCalibrationId: string,
  ) {
    super();
  }
}
