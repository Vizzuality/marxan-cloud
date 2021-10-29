import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersProjectsApiEntity } from '@marxan-api/modules/projects/control-level/users-projects.api.entity';

import { ProjectAclService } from './project-acl.service';

@Module({
  imports: [
    CqrsModule,
    // this entity most likely shouldn't be under `projects`
    TypeOrmModule.forFeature([UsersProjectsApiEntity]),
  ],
  providers: [ProjectAclService],
  exports: [ProjectAclService],
})
export class ProjectAclModule {}
