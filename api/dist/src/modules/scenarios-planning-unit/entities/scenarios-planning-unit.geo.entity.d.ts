import { LockStatus } from '../lock-status.enum';
export declare const scenariosPuDataEntityName = "scenarios_pu_data";
export declare class ScenariosPlanningUnitGeoEntity {
    id: string;
    puGeometryId: string;
    scenarioId: string;
    planningUnitMarxanId: number;
    lockStatus: LockStatus;
}
