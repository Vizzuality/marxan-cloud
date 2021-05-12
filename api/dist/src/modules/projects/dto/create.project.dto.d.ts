import { Polygon, MultiPolygon } from 'geojson';
import { PlanningUnitGridShape } from '../project.api.entity';
export declare class CreateProjectDTO {
    name: string;
    description?: string;
    organizationId: string;
    countryId?: string;
    adminAreaLevel1Id?: string;
    adminAreaLevel2Id?: string;
    planningUnitGridShape?: PlanningUnitGridShape;
    planningUnitAreakm2?: number;
    extent?: MultiPolygon | Polygon;
    metadata?: Record<string, unknown>;
}
