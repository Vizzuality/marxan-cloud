/// <reference types="multer" />
import { BaseServiceResource } from 'types/resource.interface';
import { AppInfoDTO } from 'dto/info.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateProtectedAreaDTO } from './dto/create.protected-area.dto';
import { UpdateProtectedAreaDTO } from './dto/update.protected-area.dto';
import { IUCNCategory, ProtectedArea } from './protected-area.geo.entity';
import { AppBaseService, JSONAPISerializerConfig } from 'utils/app-base.service';
import { FetchSpecification } from 'nestjs-base-service';
import { IUCNProtectedAreaCategoryResult } from './dto/iucn-protected-area-category.dto';
declare const protectedAreaFilterKeyNames: readonly ["fullName", "wdpaId", "iucnCategory", "status", "designation", "countryId"];
declare type ProtectedAreaFilterKeys = keyof Pick<ProtectedArea, typeof protectedAreaFilterKeyNames[number]>;
declare type ProtectedAreaBaseFilters = Record<ProtectedAreaFilterKeys, string[]>;
export declare const protectedAreaResource: BaseServiceResource;
declare class ProtectedAreaFilters {
    onlyCategories?: boolean;
    adminAreaId?: string;
}
export declare class ProtectedAreasService extends AppBaseService<ProtectedArea, CreateProtectedAreaDTO, UpdateProtectedAreaDTO, AppInfoDTO> {
    protected readonly repository: Repository<ProtectedArea>;
    constructor(repository: Repository<ProtectedArea>);
    setFilters(query: SelectQueryBuilder<ProtectedArea>, filters: ProtectedAreaBaseFilters & ProtectedAreaFilters, _info?: AppInfoDTO): SelectQueryBuilder<ProtectedArea>;
    get serializerConfig(): JSONAPISerializerConfig<ProtectedArea>;
    importProtectedAreaShapefile(_file: Express.Multer.File): Promise<ProtectedArea>;
    listProtectedAreaCategories(): Promise<Array<string | undefined>>;
    findAllProtectedAreaCategories(fetchSpecification: FetchSpecification): Promise<IUCNProtectedAreaCategoryResult[]>;
    findAllWDPAProtectedAreasInPlanningAreaByIUCNCategory(planningAreaId: string, iucnCategories: IUCNCategory[]): Promise<ProtectedArea[]>;
}
export {};
