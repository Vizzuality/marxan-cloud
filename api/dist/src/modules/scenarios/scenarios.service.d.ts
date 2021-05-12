/// <reference types="multer" />
import { AppInfoDTO } from 'dto/info.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateScenarioDTO } from './dto/create.scenario.dto';
import { UpdateScenarioDTO } from './dto/update.scenario.dto';
import { Scenario } from './scenario.api.entity';
import { UsersService } from 'modules/users/users.service';
import { AppBaseService, JSONAPISerializerConfig } from 'utils/app-base.service';
import { Project } from 'modules/projects/project.api.entity';
import { ProtectedAreasService } from 'modules/protected-areas/protected-areas.service';
import { ProjectsService } from 'modules/projects/projects.service';
import { WdpaAreaCalculationService } from './wdpa-area-calculation.service';
declare const scenarioFilterKeyNames: readonly ["name", "type", "projectId", "status"];
declare type ScenarioFilterKeys = keyof Pick<Scenario, typeof scenarioFilterKeyNames[number]>;
declare type ScenarioFilters = Record<ScenarioFilterKeys, string[]>;
export declare class ScenariosService extends AppBaseService<Scenario, CreateScenarioDTO, UpdateScenarioDTO, AppInfoDTO> {
    protected readonly repository: Repository<Scenario>;
    protected readonly projectRepository: Repository<Project>;
    protected readonly usersService: UsersService;
    protected readonly protectedAreasService: ProtectedAreasService;
    protected readonly projectsService: ProjectsService;
    private readonly wdpaCalculationsDetector;
    constructor(repository: Repository<Scenario>, projectRepository: Repository<Project>, usersService: UsersService, protectedAreasService: ProtectedAreasService, projectsService: ProjectsService, wdpaCalculationsDetector: WdpaAreaCalculationService);
    actionAfterCreate(model: Scenario, createModel: CreateScenarioDTO, _?: AppInfoDTO): Promise<void>;
    actionAfterUpdate(model: Scenario, updateModel: UpdateScenarioDTO, _?: AppInfoDTO): Promise<void>;
    get serializerConfig(): JSONAPISerializerConfig<Scenario>;
    importLegacyScenario(_file: Express.Multer.File): Promise<Scenario>;
    fakeFindOne(_id: string): Promise<Scenario>;
    setFilters(query: SelectQueryBuilder<Scenario>, filters: ScenarioFilters, _info?: AppInfoDTO): SelectQueryBuilder<Scenario>;
    setDataCreate(create: CreateScenarioDTO, info?: AppInfoDTO): Promise<Scenario>;
    setDataUpdate(model: Scenario, update: UpdateScenarioDTO, info?: AppInfoDTO): Promise<Scenario>;
    getWDPAAreasWithinProjectByIUCNCategory({ projectId, wdpaIucnCategories, }: Pick<CreateScenarioDTO, 'projectId' | 'wdpaIucnCategories'> | Pick<UpdateScenarioDTO, 'projectId' | 'wdpaIucnCategories'>, _info?: AppInfoDTO): Promise<string[] | undefined>;
}
export {};
