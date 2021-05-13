import { ICommand } from '@nestjs/cqrs';

export type CalculatePlanningUnitsProtectionLevelResult = true | false;

export class CalculatePlanningUnitsProtectionLevel implements ICommand {
  constructor(
    // TODO define real contract
    public readonly scenarioId: string,
  ) {}
}
