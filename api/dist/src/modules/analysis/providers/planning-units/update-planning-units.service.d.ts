import { AdjustPlanningUnits } from '../../entry-points/adjust-planning-units';
import { AdjustPlanningUnitsInput } from '../../entry-points/adjust-planning-units-input';
import { ArePuidsAllowedPort } from './are-puids-allowed.port';
import { RequestJobPort } from './request-job.port';
declare type Success = true;
export declare class UpdatePlanningUnitsService implements AdjustPlanningUnits {
    private readonly puUuidValidator;
    private readonly jobRequester;
    constructor(puUuidValidator: ArePuidsAllowedPort, jobRequester: RequestJobPort);
    update(scenarioId: string, constraints: AdjustPlanningUnitsInput): Promise<Success>;
}
export {};
