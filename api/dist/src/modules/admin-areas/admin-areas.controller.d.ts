import { AdminAreaResult } from './admin-area.geo.entity';
import { AdminAreaLevel, AdminAreasService } from './admin-areas.service';
import { FetchSpecification } from 'nestjs-base-service';
export declare class AdminAreasController {
    readonly service: AdminAreasService;
    constructor(service: AdminAreasService);
    findAllAdminAreasInGivenCountry(fetchSpecification: FetchSpecification, countryId: string, { level }: AdminAreaLevel): Promise<AdminAreaResult[]>;
    findAllChildrenAdminAreas(fetchSpecification: FetchSpecification, areaId: string): Promise<AdminAreaResult[]>;
    findOne(fetchSpecification: FetchSpecification, areaId: string): Promise<AdminAreaResult>;
}
