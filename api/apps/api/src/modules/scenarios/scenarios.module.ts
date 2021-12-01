import { forwardRef, HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { MarxanInput } from '@marxan/marxan-input/marxan-input';
import { ScenariosController } from './scenarios.controller';
import { Scenario } from './scenario.api.entity';
import { ScenariosCrudService } from './scenarios-crud.service';
import { UsersModule } from '@marxan-api/modules/users/users.module';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { ProjectsModule } from '@marxan-api/modules/projects/projects.module';
import { ScenarioFeaturesModule } from '../scenarios-features';
import { ProxyService } from '@marxan-api/modules/proxy/proxy.service';
import { WdpaAreaCalculationService } from './wdpa-area-calculation.service';
import { AnalysisModule } from '../analysis/analysis.module';
import { CostSurfaceModule } from './cost-surface/cost-surface.module';
import { ScenariosService } from './scenarios.service';
import { ScenarioSerializer } from './dto/scenario.serializer';
import { ScenarioFeatureSerializer } from './dto/scenario-feature.serializer';
import { CostSurfaceTemplateModule } from './cost-surface-template';
import { SolutionResultCrudService } from './solutions-result/solution-result-crud.service';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { ApiEventsModule } from '@marxan-api/modules/api-events';
import {
  ProtectionStatusModule,
  ScenariosPlanningUnitGeoEntity,
  ScenariosPuOutputGeoEntity,
} from '@marxan/scenarios-planning-unit';
import { ScenariosOutputResultsApiEntity } from '@marxan/marxan-output';
import { ScenarioSolutionSerializer } from './dto/scenario-solution.serializer';
import { PlanningUnitsProtectionLevelModule } from '@marxan-api/modules/planning-units-protection-level';
import { OutputFilesModule } from './output-files/output-files.module';
import { ZipFilesSerializer } from './dto/zip-files.serializer';
import { InputFilesModule } from './input-files';
import { MarxanRunModule } from './marxan-run';
import { GeoFeaturesModule } from '../geo-features/geo-features.module';
import { ScenarioPlanningUnitSerializer } from './dto/scenario-planning-unit.serializer';
import { ScenarioPlanningUnitsService } from './planning-units/scenario-planning-units.service';
import { ScenarioPlanningUnitsLinkerService } from './planning-units/scenario-planning-units-linker-service';
import { AdminAreasModule } from '../admin-areas/admin-areas.module';

import { SpecificationModule } from './specification';
import { ScenarioFeaturesGapDataSerializer } from './dto/scenario-feature-gap-data.serializer';
import { ScenarioFeaturesOutputGapDataSerializer } from './dto/scenario-feature-output-gap-data.serializer';
import { CostRangeService } from './cost-range-service';
import { ProjectChecker } from './project-checker.service';
import { ProtectedAreaModule } from './protected-area';
import { ProtectedAreasCrudModule } from '@marxan-api/modules/protected-areas/protected-areas-crud.module';
import { PlanningAreasModule } from '@marxan-api/modules/projects/planning-areas';
import { BlmValuesModule } from '@marxan-api/modules/blm';

@Module({
  imports: [
    CqrsModule,
    GeoFeaturesModule,
    SpecificationModule,
    forwardRef(() => ProjectsModule),
    TypeOrmModule.forFeature([
      Project,
      Scenario,
      ScenariosOutputResultsApiEntity,
    ]),
    TypeOrmModule.forFeature(
      [ScenariosPuOutputGeoEntity, ScenariosPlanningUnitGeoEntity],
      DbConnections.geoprocessingDB,
    ),
    ProtectionStatusModule.for(DbConnections.geoprocessingDB),
    PlanningAreasModule,
    UsersModule,
    ScenarioFeaturesModule,
    AnalysisModule,
    CostSurfaceModule,
    HttpModule,
    CostSurfaceTemplateModule,
    InputFilesModule,
    PlanningUnitsProtectionLevelModule,
    OutputFilesModule,
    MarxanRunModule,
    AdminAreasModule,
    ApiEventsModule,
    ProtectedAreaModule,
    ProtectedAreasCrudModule,
    BlmValuesModule,
  ],
  providers: [
    ProjectChecker,
    ScenariosService,
    ScenariosCrudService,
    ProxyService,
    WdpaAreaCalculationService,
    ScenarioPlanningUnitsService,
    ScenarioPlanningUnitsLinkerService,
    ScenarioSerializer,
    ScenarioFeatureSerializer,
    ScenarioFeaturesGapDataSerializer,
    ScenarioFeaturesOutputGapDataSerializer,
    SolutionResultCrudService,
    ScenarioSolutionSerializer,
    MarxanInput,
    ZipFilesSerializer,
    ScenarioPlanningUnitSerializer,
    CostRangeService,
  ],
  controllers: [ScenariosController],
  exports: [ScenariosCrudService, ScenariosService],
})
export class ScenariosModule {}
