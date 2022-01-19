import { Module } from '@nestjs/common';
import { ProjectChecker } from '@marxan-api/modules/projects/project-checker/project-checker.service';
import { MarxanProjectChecker } from '@marxan-api/modules/projects/project-checker/marxan-project-checker.service';

@Module({
  providers: [
    {
      useClass: MarxanProjectChecker,
      provide: ProjectChecker,
    },
  ],
  exports: [ProjectChecker],
})
export class ProjectCheckerModule {}
