import { Module } from '@nestjs/common';
import { ProjectChecker } from '@marxan-api/modules/scenarios/project-checker/project-checker.service';
import { MarxanProjectChecker } from '@marxan-api/modules/scenarios/project-checker/project-checker.service-real';

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
