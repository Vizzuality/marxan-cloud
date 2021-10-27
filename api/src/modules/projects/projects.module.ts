import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProjectsController } from './projects.controller';
import { Project } from './project.api.entity';
import { ProjectsService } from './projects.service';
import { UsersModule } from 'modules/users/users.module';
import { ScenariosModule } from 'modules/scenarios/scenarios.module';

@Module({
  imports: [TypeOrmModule.forFeature([Project]), ScenariosModule, UsersModule],
  providers: [ProjectsService],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}
