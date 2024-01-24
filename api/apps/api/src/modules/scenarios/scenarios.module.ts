import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
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
import { AnalysisModule } from '../analysis/analysis.module';
import { CostSurfaceModule } from '@marxan-api/modules/cost-surface/cost-surface.module';
import { ScenariosService } from './scenarios.service';
import { ScenarioSerializer } from './dto/scenario.serializer';
import { ScenarioFeatureSerializer } from './dto/scenario-feature.serializer';
import { ProjectTemplateModule } from '../projects/shapefile-template';
import { SolutionResultCrudService } from './solutions-result/solution-result-crud.service';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { ApiEventsModule } from '@marxan-api/modules/api-events';
import { ScenariosPlanningUnitGeoEntity } from '@marxan/scenarios-planning-unit';
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
import { ProtectedAreaModule } from './protected-area';
import { ProtectedAreasCrudModule } from '@marxan-api/modules/protected-areas/protected-areas-crud.module';
import { PlanningAreasModule } from '@marxan-api/modules/planning-areas';
import { BlmValuesModule } from '@marxan-api/modules/blm';
import { BlmCalibrationModule } from './blm-calibration/blm-calibration.module';
import { ProjectCheckerModule } from '@marxan-api/modules/projects/project-checker/project-checker.module';
import { AccessControlModule } from '@marxan-api/modules/access-control';
import { UsersScenariosApiEntity } from '@marxan-api/modules/access-control/scenarios-acl/entity/users-scenarios.api.entity';
import { BlockGuardModule } from '@marxan-api/modules/projects/block-guard/block-guard.module';
import { ScenarioLockEntity } from '@marxan-api/modules/access-control/scenarios-acl/locks/entity/scenario.lock.api.entity';
import { LockService } from '../access-control/scenarios-acl/locks/lock.service';
import { IssuedAuthnToken } from '../authentication/issued-authn-token.api.entity';
import { WebshotModule } from '@marxan/webshot';
import { DeleteScenarioModule } from './delete-scenario/delete-scenario.module';
import { LegacyProjectImportCheckerModule } from '../legacy-project-import/domain/legacy-project-import-checker/legacy-project-import-checker.module';
import { CostSurface } from '@marxan-api/modules/cost-surface/cost-surface.api.entity';

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
      UsersScenariosApiEntity,
      ScenarioLockEntity,
      IssuedAuthnToken,
      CostSurface,
    ]),
    TypeOrmModule.forFeature(
      [ScenariosPlanningUnitGeoEntity],
      DbConnections.geoprocessingDB,
    ),
    BlockGuardModule,
    ProjectCheckerModule,
    LegacyProjectImportCheckerModule,
    PlanningAreasModule,
    UsersModule,
    ScenarioFeaturesModule,
    AnalysisModule,
    CostSurfaceModule,
    HttpModule,
    ProjectTemplateModule,
    InputFilesModule,
    PlanningUnitsProtectionLevelModule,
    OutputFilesModule,
    MarxanRunModule,
    AdminAreasModule,
    ApiEventsModule,
    ProtectedAreaModule,
    ProtectedAreasCrudModule,
    BlmValuesModule,
    BlmCalibrationModule,
    AccessControlModule,
    forwardRef(() => WebshotModule),
    DeleteScenarioModule,
  ],
  providers: [
    ScenariosService,
    ScenariosCrudService,
    ProxyService,
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
    LockService,
  ],
  controllers: [ScenariosController],
  exports: [ScenariosCrudService, ScenariosService],
})
export class ScenariosModule {}
