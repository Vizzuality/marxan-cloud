import { Dictionary } from 'lodash';
import { Project } from '../projects/project.api.entity';
import { User } from '../users/user.api.entity';
import { TimeUserEntityMetadata } from '../../types/time-user-entity-metadata';
import { BaseServiceResource } from '../../types/resource.interface';
import { IUCNCategory } from '../protected-areas/protected-area.geo.entity';
export declare const scenarioResource: BaseServiceResource;
export declare enum ScenarioType {
    marxan = "marxan",
    marxanWithZones = "marxan-with-zones"
}
export declare enum JobStatus {
    created = "created",
    running = "running",
    done = "done",
    failure = "failure"
}
export declare class Scenario extends TimeUserEntityMetadata {
    id: string;
    name: string;
    description?: string;
    type: ScenarioType;
    project?: Project;
    projectId: string;
    wdpaIucnCategories?: IUCNCategory[];
    protectedAreaFilterByIds?: string[];
    wdpaThreshold?: number | null;
    numberOfRuns?: number;
    boundaryLengthModifier?: number;
    metadata?: Dictionary<string>;
    status: JobStatus;
    parentScenarioId?: string;
    parentScenario?: Scenario;
    users: Partial<User>[];
}
export declare class JSONAPIScenarioData {
    type: string;
    id: string;
    attributes: Scenario;
}
export declare class ScenarioResult {
    data: JSONAPIScenarioData;
}
