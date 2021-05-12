import { IUCNCategory } from 'modules/protected-areas/protected-area.geo.entity';
import { JobStatus, ScenarioType } from '../scenario.api.entity';
export declare class CreateScenarioDTO {
    name: string;
    description?: string;
    type: ScenarioType;
    projectId: string;
    wdpaIucnCategories?: IUCNCategory[];
    customProtectedAreaIds?: string[];
    wdpaThreshold?: number;
    numberOfRuns?: number;
    boundaryLengthModifier?: number;
    metadata?: Record<string, unknown>;
    status?: JobStatus;
}
