import { Injectable } from '@nestjs/common';
import {
  GridAsyncJob,
  LegacyImportAsyncJob,
  PlanningUnitsAsyncJob,
  ProjectCloneAsyncJob,
  ProjectExportAsyncJob,
  ProjectImportAsyncJob,
} from './async-jobs';
import { AsyncJobsGarbageCollector } from './async-jobs.garbage-collector';

@Injectable()
export class ProjectAsyncJobsGarbageCollector
  implements AsyncJobsGarbageCollector {
  constructor(
    private readonly gridAsyncJob: GridAsyncJob,
    private readonly legacyImportAsyncJob: LegacyImportAsyncJob,
    private readonly planningUnitsAsyncJob: PlanningUnitsAsyncJob,
    private readonly projectCloneAsyncJob: ProjectCloneAsyncJob,
    private readonly projectExportAsyncJob: ProjectExportAsyncJob,
    private readonly projectImportAsyncJob: ProjectImportAsyncJob,
  ) {}
  public async sendFailedApiEventsForStuckAsyncJobs(projectId: string) {
    await Promise.all([
      this.gridAsyncJob.sendFailedApiEventForStuckAsyncJob(projectId),
      this.legacyImportAsyncJob.sendFailedApiEventForStuckAsyncJob(projectId),
      this.planningUnitsAsyncJob.sendFailedApiEventForStuckAsyncJob(projectId),
      this.projectCloneAsyncJob.sendFailedApiEventForStuckAsyncJob(projectId),
      this.projectExportAsyncJob.sendFailedApiEventForStuckAsyncJob(projectId),
      this.projectImportAsyncJob.sendFailedApiEventForStuckAsyncJob(projectId),
    ]);
  }
}
