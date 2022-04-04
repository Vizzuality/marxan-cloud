import { WebshotConfig } from '@marxan/webshot';
import { Command } from '@nestjs-architects/typed-cqrs';

export class StartBlmCalibration extends Command<void> {
  constructor(
    public readonly scenarioId: string,
    public readonly blmValues: number[],
    public readonly config: WebshotConfig,
  ) {
    super();
  }
}
