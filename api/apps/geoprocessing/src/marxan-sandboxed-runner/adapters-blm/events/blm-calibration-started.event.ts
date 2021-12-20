import { IEvent } from '@nestjs/cqrs';

export class BlmCalibrationStarted implements IEvent {
  constructor(
    public readonly scenarioId: string,
    public readonly calibrationId: string,
  ) {}
}
