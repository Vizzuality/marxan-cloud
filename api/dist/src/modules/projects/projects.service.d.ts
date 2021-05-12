/// <reference types="multer" />
import { AppInfoDTO } from 'dto/info.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Project } from './project.api.entity';
import { CreateProjectDTO } from './dto/create.project.dto';
import { UpdateProjectDTO } from './dto/update.project.dto';
import { UsersService } from 'modules/users/users.service';
import { ScenariosService } from 'modules/scenarios/scenarios.service';
import { PlanningUnitsService } from 'modules/planning-units/planning-units.service';
import { AppBaseService, JSONAPISerializerConfig } from 'utils/app-base.service';
import { Country } from 'modules/countries/country.geo.entity';
import { AdminArea } from 'modules/admin-areas/admin-area.geo.entity';
import { AdminAreasService } from 'modules/admin-areas/admin-areas.service';
import { CountriesService } from 'modules/countries/countries.service';
declare const projectFilterKeyNames: readonly ["name", "organizationId", "countryId", "adminAreaLevel1Id", "adminAreaLevel2Id"];
declare type ProjectFilterKeys = keyof Pick<Project, typeof projectFilterKeyNames[number]>;
declare type ProjectFilters = Record<ProjectFilterKeys, string[]>;
export declare class ProjectsService extends AppBaseService<Project, CreateProjectDTO, UpdateProjectDTO, AppInfoDTO> {
    protected readonly repository: Repository<Project>;
    protected readonly scenariosService: ScenariosService;
    protected readonly usersService: UsersService;
    protected readonly adminAreasService: AdminAreasService;
    protected readonly countriesService: CountriesService;
    private readonly planningUnitsService;
    constructor(repository: Repository<Project>, scenariosService: ScenariosService, usersService: UsersService, adminAreasService: AdminAreasService, countriesService: CountriesService, planningUnitsService: PlanningUnitsService);
    get serializerConfig(): JSONAPISerializerConfig<Project>;
    importLegacyProject(_file: Express.Multer.File): Promise<Project>;
    fakeFindOne(_id: string): Promise<Project>;
    setFilters(query: SelectQueryBuilder<Project>, filters: ProjectFilters, _info?: AppInfoDTO): SelectQueryBuilder<Project>;
    setDataCreate(create: CreateProjectDTO, info?: AppInfoDTO): Promise<Project>;
    getPlanningArea(project: Partial<Project>): Promise<Country | Partial<AdminArea | undefined>>;
    actionAfterCreate(model: Project, createModel: CreateProjectDTO, _info?: AppInfoDTO): Promise<void>;
    actionAfterUpdate(model: Project, createModel: UpdateProjectDTO, _info?: AppInfoDTO): Promise<void>;
}
export {};
