import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';

import { ProjectAclService } from './project-acl.service';
import { ProjectAclController } from './project-acl.controller';

@Module({
  imports: [
    CqrsModule,
    // this entity most likely shouldn't be under `projects`
    TypeOrmModule.forFeature([UsersProjectsApiEntity]),
  ],
  providers: [ProjectAclService],
  exports: [ProjectAclService],
  controllers: [ProjectAclController],
})
export class ProjectAclModule {}
