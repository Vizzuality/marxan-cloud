/// <reference types="multer" />
import { Project, ProjectResultSingular, ProjectResultPlural } from './project.api.entity';
import { ProjectsService } from './projects.service';
import { UpdateProjectDTO } from './dto/update.project.dto';
import { CreateProjectDTO } from './dto/create.project.dto';
import { RequestWithAuthenticatedUser } from 'app.controller';
import { FetchSpecification } from 'nestjs-base-service';
import { GeoFeatureResult } from 'modules/geo-features/geo-feature.api.entity';
import { GeoFeaturesService } from 'modules/geo-features/geo-features.service';
export declare class ProjectsController {
    readonly service: ProjectsService;
    private readonly geoFeaturesService;
    constructor(service: ProjectsService, geoFeaturesService: GeoFeaturesService);
    findAllGeoFeaturesForProject(fetchSpecification: FetchSpecification, params: {
        projectId: string;
    }, featureClassAndAliasFilter: string): Promise<GeoFeatureResult>;
    importLegacyProject(file: Express.Multer.File): Promise<Project>;
    findAll(fetchSpecification: FetchSpecification): Promise<ProjectResultPlural>;
    findOne(id: string): Promise<ProjectResultSingular>;
    create(dto: CreateProjectDTO, req: RequestWithAuthenticatedUser): Promise<ProjectResultSingular>;
    update(id: string, dto: UpdateProjectDTO): Promise<ProjectResultSingular>;
    delete(id: string): Promise<void>;
}
