import { AppInfoDTO } from 'dto/info.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateOrganizationDTO } from './dto/create.organization.dto';
import { UpdateOrganizationDTO } from './dto/update.organization.dto';
import { Organization } from './organization.api.entity';
import { UsersService } from 'modules/users/users.service';
import { AppBaseService, JSONAPISerializerConfig } from 'utils/app-base.service';
declare const organizationFilterKeyNames: readonly ["name"];
declare type OrganizationFilterKeys = keyof Pick<Organization, typeof organizationFilterKeyNames[number]>;
declare type OrganizationFilters = Record<OrganizationFilterKeys, string[]>;
export declare class OrganizationsService extends AppBaseService<Organization, CreateOrganizationDTO, UpdateOrganizationDTO, AppInfoDTO> {
    protected readonly repository: Repository<Organization>;
    private readonly usersService;
    constructor(repository: Repository<Organization>, usersService: UsersService);
    get serializerConfig(): JSONAPISerializerConfig<Organization>;
    fakeFindOne(_id: string): Promise<Organization>;
    setFilters(query: SelectQueryBuilder<Organization>, filters: OrganizationFilters, _info?: AppInfoDTO): SelectQueryBuilder<Organization>;
    setDataCreate(create: CreateOrganizationDTO, info?: AppInfoDTO): Promise<Organization>;
    remove(id: string): Promise<void>;
}
export {};
