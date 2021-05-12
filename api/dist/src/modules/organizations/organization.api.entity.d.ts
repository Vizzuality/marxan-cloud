import { Project } from '../projects/project.api.entity';
import { BaseServiceResource } from '../../types/resource.interface';
import { TimeUserEntityMetadata } from '../../types/time-user-entity-metadata';
export declare const organizationResource: BaseServiceResource;
export declare class Organization extends TimeUserEntityMetadata {
    id: string;
    name: string;
    description?: string;
    metadata?: Record<string, unknown>;
    projects?: Project[];
}
export declare class JSONAPIOrganizationData {
    type: string;
    id: string;
    attributes: Organization;
    relationships?: Record<string, unknown>;
}
export declare class OrganizationResultSingular {
    data: JSONAPIOrganizationData;
}
export declare class OrganizationResultPlural {
    data: JSONAPIOrganizationData[];
}
