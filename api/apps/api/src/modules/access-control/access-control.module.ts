import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersProjectsApiEntity } from '@marxan-api/modules/projects/control-level/users-projects.api.entity';

import { ProjectAccessControl } from './projects-acl/project-access-control';
import { ProjectAclService } from './projects-acl/project-acl.service';

@Module({
  imports: [TypeOrmModule.forFeature([UsersProjectsApiEntity])],
  providers: [
    {
      provide: ProjectAccessControl,
      useClass: ProjectAclService,
    },
  ],
  exports: [ProjectAccessControl],
})
export class AccessControlModule {}
