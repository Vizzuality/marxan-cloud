import { User } from '../users/user.api.entity';
import { Scenario } from '../scenarios/scenario.api.entity';
import { Organization } from '../organizations/organization.api.entity';
import { TimeUserEntityMetadata } from '../../types/time-user-entity-metadata';
import { BaseServiceResource } from '../../types/resource.interface';
export declare const projectResource: BaseServiceResource;
export declare enum PlanningUnitGridShape {
    square = "square",
    hexagon = "hexagon",
    fromShapefile = "from_shapefile"
}
export declare class Project extends TimeUserEntityMetadata {
    id: string;
    name: string;
    description?: string;
    organization?: Organization;
    organizationId: string;
    countryId: string;
    adminAreaLevel1Id?: string;
    adminAreaLevel2Id?: string;
    planningAreaGeometryId?: string;
    planningUnitGridShape?: PlanningUnitGridShape;
    planningUnitAreakm2?: number;
    extent?: Record<string, unknown> | null;
    metadata?: Record<string, unknown>;
    scenarios?: Scenario[];
    users?: Partial<User>[];
}
export declare class JSONAPIProjectData {
    type: string;
    id: string;
    attributes: Project;
    relationships?: Record<string, unknown>;
}
export declare class ProjectResultPlural {
    data: JSONAPIProjectData[];
}
export declare class ProjectResultSingular {
    data: JSONAPIProjectData;
}
