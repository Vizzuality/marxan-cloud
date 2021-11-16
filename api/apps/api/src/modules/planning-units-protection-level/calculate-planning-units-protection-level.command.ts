import { Command } from '@nestjs-architects/typed-cqrs';

export type CalculatePlanningUnitsProtectionLevelResult = true | false;

export class CalculatePlanningUnitsProtectionLevel extends Command<void> {
  constructor(
    public readonly scenarioId: string,
    public readonly protectedAreaFilterByIds: string[] | undefined,
  ) {
    super();
  }
}
