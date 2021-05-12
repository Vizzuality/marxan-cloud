import { ProtectedAreaResult } from './protected-area.geo.entity';
import { FetchSpecification } from 'nestjs-base-service';
import { ProtectedAreasService } from './protected-areas.service';
import { IUCNProtectedAreaCategoryResult } from './dto/iucn-protected-area-category.dto';
export declare class ProtectedAreasController {
    readonly service: ProtectedAreasService;
    constructor(service: ProtectedAreasService);
    findAll(fetchSpecification: FetchSpecification): Promise<ProtectedAreaResult>;
    listIUCNProtectedAreaCategories(fetchSpecification: FetchSpecification): Promise<IUCNProtectedAreaCategoryResult[]>;
    findOne(id: string, fetchSpecification: FetchSpecification): Promise<ProtectedAreaResult>;
}
