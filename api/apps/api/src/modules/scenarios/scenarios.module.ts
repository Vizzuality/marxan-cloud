import { forwardRef, Module, HttpModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { MarxanInput } from '@marxan/marxan-input/marxan-input';
import { ScenariosController } from './scenarios.controller';
import { Scenario } from './scenario.api.entity';
import { ScenariosCrudService } from './scenarios-crud.service';
import { UsersModule } from '@marxan-api/modules/users/users.module';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { ProtectedAreasModule } from '@marxan-api/modules/protected-areas/protected-areas.module';
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
import {
  ScenariosOutputResultsApiEntity,
  ScenariosPuOutputGeoEntity,
} from '@marxan/scenarios-planning-unit';
import { ScenarioSolutionSerializer } from './dto/scenario-solution.serializer';
import { CostSurfaceViewModule } from './cost-surface-readmodel/cost-surface-view.module';
import { PlanningUnitsProtectionLevelModule } from '@marxan-api/modules/planning-units-protection-level';
import {
  InputParameterFileProvider,
  IoSettings,
  ioSettingsToken,
} from './input-parameter-file.provider';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { assertDefined } from '@marxan/utils';
import { SpecDatModule } from './input-files/spec.dat.module';
import { PuvsprDatModule } from './input-files/puvspr.dat.module';

import { MarxanRunService } from './marxan-run/marxan-run.service';
import { MarxanRunController } from './marxan-run/marxan-run.controller';
import { OutputFilesModule } from './output-files/output-files.module';
import { ZipFilesSerializer } from './dto/zip-files.serializer';
import { BoundDatModule } from './input-files/bound.dat.module';

@Module({
  imports: [
    CqrsModule,
    ProtectedAreasModule,
    forwardRef(() => ProjectsModule),
    TypeOrmModule.forFeature([
      Project,
      Scenario,
      ScenariosOutputResultsApiEntity,
    ]),
    TypeOrmModule.forFeature(
      [ScenariosPuOutputGeoEntity],
      DbConnections.geoprocessingDB,
    ),
    UsersModule,
    ScenarioFeaturesModule,
    AnalysisModule,
    CostSurfaceModule,
    HttpModule,
    CostSurfaceTemplateModule,
    CostSurfaceViewModule,
    SpecDatModule,
    PuvsprDatModule,
    BoundDatModule,
    PlanningUnitsProtectionLevelModule,
    OutputFilesModule,
  ],
  providers: [
    ScenariosService,
    ScenariosCrudService,
    ProxyService,
    WdpaAreaCalculationService,
    ScenarioSerializer,
    ScenarioFeatureSerializer,
    SolutionResultCrudService,
    ScenarioSolutionSerializer,
    MarxanInput,
    InputParameterFileProvider,
    MarxanRunService,
    ZipFilesSerializer,
    {
      provide: ioSettingsToken,
      useFactory: () => {
        const config = AppConfig.get<IoSettings>(
          'marxan.inputFiles.inputDat.ioSettings',
        );
        assertDefined(config);
        return config;
      },
    },
  ],
  controllers: [ScenariosController, MarxanRunController],
  exports: [ScenariosCrudService, ScenariosService],
})
export class ScenariosModule {}
