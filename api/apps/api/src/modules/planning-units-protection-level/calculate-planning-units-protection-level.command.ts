import { ICommand } from '@nestjs/cqrs';

export type CalculatePlanningUnitsProtectionLevelResult = true | false;

export class CalculatePlanningUnitsProtectionLevel implements ICommand {
  constructor(
    public readonly scenarioId: string,
    public readonly protectedAreaFilterByIds: string[] | undefined,
  ) {}
}
