import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';

import { ProjectAclService } from '@marxan-api/modules/access-control/projects-acl/project-acl.service';
import { ProjectAclController } from '@marxan-api/modules/access-control/projects-acl/project-acl.controller';
import { UsersModule } from '@marxan-api/modules/users/users.module';
import { ProjectsModule } from '@marxan-api/modules/projects/projects.module';
import { PublishedProject } from '@marxan-api/modules/published-project/entities/published-project.api.entity';
import { ScenarioLockEntity } from '@marxan-api/modules/access-control/scenarios-acl/locks/entity/scenario.lock.api.entity';
import { LockService } from '@marxan-api/modules/access-control/scenarios-acl/locks/lock.service';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      UsersProjectsApiEntity,
      PublishedProject,
      ScenarioLockEntity,
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => ProjectsModule),
  ],
  providers: [ProjectAclService, LockService],
  exports: [ProjectAclService],
  controllers: [ProjectAclController],
})
export class ProjectAclModule {}
