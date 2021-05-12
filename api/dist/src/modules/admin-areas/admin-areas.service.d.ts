import { AppInfoDTO } from 'dto/info.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { AdminArea } from './admin-area.geo.entity';
import { CreateAdminAreaDTO } from './dto/create.admin-area.dto';
import { UpdateAdminAreaDTO } from './dto/update.admin-area.dto';
import { AppBaseService, JSONAPISerializerConfig, PaginationMeta } from 'utils/app-base.service';
import { FetchSpecification } from 'nestjs-base-service';
export declare class AdminAreaLevel {
    level?: 1 | 2;
}
declare type AdminAreaFilters = {
    countryId: string;
    level2AreaByArea1Id: string;
} & AdminAreaLevel;
export declare class AdminAreasService extends AppBaseService<AdminArea, CreateAdminAreaDTO, UpdateAdminAreaDTO, AppInfoDTO> {
    private readonly adminAreasRepository;
    constructor(adminAreasRepository: Repository<AdminArea>);
    get serializerConfig(): JSONAPISerializerConfig<AdminArea>;
    fakeFindOne(_id: string): Promise<AdminArea>;
    setFilters(query: SelectQueryBuilder<AdminArea>, filters?: AdminAreaFilters, _info?: AppInfoDTO): SelectQueryBuilder<AdminArea>;
    getByLevel1OrLevel2Id(areaId: string, fetchSpecification?: FetchSpecification): Promise<Partial<AdminArea>>;
    getChildrenAdminAreas(parentAreaId: string, fetchSpecification?: FetchSpecification): Promise<{
        data: (AdminArea | Partial<AdminArea> | undefined)[];
        metadata: PaginationMeta | undefined;
    }>;
    isLevel1AreaId(areaId: string): boolean;
    isLevel2AreaId(areaId: string): boolean;
    static levelFromId(areaId: string): number;
}
export {};
