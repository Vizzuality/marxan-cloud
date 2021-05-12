import { ICommand } from '@nestjs/cqrs';
export declare type CalculatePlanningUnitsProtectionLevelResult = true | false;
export declare class CalculatePlanningUnitsProtectionLevel implements ICommand {
    readonly scenarioId: string;
    constructor(scenarioId: string);
}
