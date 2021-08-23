import { Module } from '@nestjs/common';
import { ProjectAclService } from './project-acl.service';

@Module({
  providers: [ProjectAclService],
  exports: [ProjectAclService],
})
export class ProjectAclModule {}
