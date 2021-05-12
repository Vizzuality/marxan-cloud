import { ArePuidsAllowedPort } from '../are-puids-allowed.port';
import { ScenariosPlanningUnitService } from '../../../../scenarios-planning-unit/scenarios-planning-unit.service';
export declare class ArePuidsAllowedAdapter extends ScenariosPlanningUnitService implements ArePuidsAllowedPort {
    validate(scenarioId: string, puIds: string[]): Promise<{
        errors: unknown[];
    }>;
}
