import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScenariosController } from './scenarios.controller';
import { Scenario } from './scenario.api.entity';
import { ScenariosService } from './scenarios.service';
import { UsersModule } from 'modules/users/users.module';
import { Project } from 'modules/projects/project.api.entity';
import { ProtectedAreasModule } from 'modules/protected-areas/protected-areas.module';
import { ProjectsModule } from 'modules/projects/projects.module';
import { ScenarioFeaturesModule } from '../scenarios-features';

@Module({
  imports: [
    ProtectedAreasModule,
    forwardRef(() => ProjectsModule),
    TypeOrmModule.forFeature([Project, Scenario]),
    UsersModule,
    ScenarioFeaturesModule,
  ],
  providers: [ScenariosService],
  controllers: [ScenariosController],
  exports: [ScenariosService],
})
export class ScenariosModule {}
