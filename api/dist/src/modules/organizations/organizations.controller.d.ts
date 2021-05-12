import { OrganizationResultSingular, OrganizationResultPlural } from './organization.api.entity';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDTO } from './dto/create.organization.dto';
import { UpdateOrganizationDTO } from './dto/update.organization.dto';
import { RequestWithAuthenticatedUser } from 'app.controller';
import { FetchSpecification } from 'nestjs-base-service';
export declare class OrganizationsController {
    readonly service: OrganizationsService;
    constructor(service: OrganizationsService);
    findAll(fetchSpecification: FetchSpecification): Promise<OrganizationResultPlural>;
    findOne(id: string): Promise<OrganizationResultSingular>;
    create(dto: CreateOrganizationDTO, req: RequestWithAuthenticatedUser): Promise<OrganizationResultSingular>;
    update(id: string, dto: UpdateOrganizationDTO): Promise<OrganizationResultSingular>;
    delete(id: string): Promise<void>;
}
