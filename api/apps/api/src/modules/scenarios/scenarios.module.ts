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

@Module({
  imports: [
    CqrsModule,
    ProtectedAreasModule,
    forwardRef(() => ProjectsModule),
    TypeOrmModule.forFeature([Project, Scenario]),
    UsersModule,
    ScenarioFeaturesModule,
    AnalysisModule,
    CostSurfaceModule,
    HttpModule,
    CostSurfaceTemplateModule,
  ],
  providers: [
    ScenariosService,
    ScenariosCrudService,
    ProxyService,
    WdpaAreaCalculationService,
    ScenarioSerializer,
    ScenarioFeatureSerializer,
    MarxanInput,
  ],
  controllers: [ScenariosController],
  exports: [ScenariosCrudService, ScenariosService],
})
export class ScenariosModule {}
