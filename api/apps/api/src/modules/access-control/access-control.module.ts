import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersProjectsApiEntity } from '@marxan-api/modules/access-control/projects-acl/entity/users-projects.api.entity';

import { ProjectAccessControl } from './projects-acl/project-access-control';
import { ProjectAclService } from './projects-acl/project-acl.service';
import { ProjectAclController } from './projects-acl/project-acl.controller';
import { ProjectAclModule } from './projects-acl/project-acl.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersProjectsApiEntity]),
    ProjectAclModule,
  ],
  providers: [
    {
      provide: ProjectAccessControl,
      useClass: ProjectAclService,
    },
  ],
  controllers: [ProjectAclController],
  exports: [ProjectAccessControl],
})
export class AccessControlModule {}
