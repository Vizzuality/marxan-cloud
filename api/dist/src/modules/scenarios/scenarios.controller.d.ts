import { ScenarioResult } from './scenario.api.entity';
import { Request, Response } from 'express';
import { ScenariosService } from './scenarios.service';
import { FetchSpecification } from 'nestjs-base-service';
import { CreateScenarioDTO } from './dto/create.scenario.dto';
import { UpdateScenarioDTO } from './dto/update.scenario.dto';
import { RequestWithAuthenticatedUser } from 'app.controller';
import { ScenarioFeaturesService } from '../scenarios-features';
import { RemoteScenarioFeaturesData } from '../scenarios-features/entities/remote-scenario-features-data.geo.entity';
import { ProcessingStatusDto } from './dto/processing-status.dto';
import { UpdateScenarioPlanningUnitLockStatusDto } from './dto/update-scenario-planning-unit-lock-status.dto';
import { ProxyService } from 'modules/proxy/proxy.service';
import { ShapefileGeoJSONResponseDTO } from './dto/shapefile.geojson.response.dto';
export declare class ScenariosController {
    readonly service: ScenariosService;
    private readonly proxyService;
    private readonly scenarioFeatures;
    constructor(service: ScenariosService, proxyService: ProxyService, scenarioFeatures: ScenarioFeaturesService);
    findAll(fetchSpecification: FetchSpecification): Promise<ScenarioResult>;
    findOne(id: string, fetchSpecification: FetchSpecification): Promise<ScenarioResult>;
    create(dto: CreateScenarioDTO, req: RequestWithAuthenticatedUser): Promise<ScenarioResult>;
    uploadLockInShapeFile(scenarioId: string, request: Request, response: Response): Promise<ShapefileGeoJSONResponseDTO>;
    update(id: string, dto: UpdateScenarioDTO): Promise<ScenarioResult>;
    delete(id: string): Promise<void>;
    changePlanningUnits(id: string, input: UpdateScenarioPlanningUnitLockStatusDto): Promise<void>;
    planningUnitsStatus(id: string): Promise<ProcessingStatusDto>;
    getScenarioFeatures(id: string): Promise<Partial<RemoteScenarioFeaturesData>[]>;
}
