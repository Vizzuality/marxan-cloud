import { Injectable } from '@nestjs/common';
import {
  GridAsyncJob,
  LegacyImportAsyncJob,
  PlanningUnitsAsyncJob,
  ProjectCloneAsyncJob,
  ProjectExportAsyncJob,
  ProjectImportAsyncJob,
  ProtectedAreasAsyncJob,
} from './async-jobs';
import { AsyncJobsGarbageCollector } from './async-jobs.garbage-collector';

@Injectable()
export class ProjectAsyncJobsGarbageCollector
  implements AsyncJobsGarbageCollector
{
  constructor(
    private readonly gridAsyncJob: GridAsyncJob,
    private readonly legacyImportAsyncJob: LegacyImportAsyncJob,
    private readonly planningUnitsAsyncJob: PlanningUnitsAsyncJob,
    private readonly projectCloneAsyncJob: ProjectCloneAsyncJob,
    private readonly projectExportAsyncJob: ProjectExportAsyncJob,
    private readonly projectImportAsyncJob: ProjectImportAsyncJob,
    private readonly protectedAreasAsyncJob: ProtectedAreasAsyncJob,
  ) {}
  public async sendFailedApiEventsForStuckAsyncJobs(projectId: string) {
    await this.gridAsyncJob.sendFailedApiEventForStuckAsyncJob(projectId);
    await this.legacyImportAsyncJob.sendFailedApiEventForStuckAsyncJob(
      projectId,
    );
    await this.planningUnitsAsyncJob.sendFailedApiEventForStuckAsyncJob(
      projectId,
    );
    await this.projectCloneAsyncJob.sendFailedApiEventForStuckAsyncJob(
      projectId,
    );
    await this.projectExportAsyncJob.sendFailedApiEventForStuckAsyncJob(
      projectId,
    );
    await this.projectImportAsyncJob.sendFailedApiEventForStuckAsyncJob(
      projectId,
    );
    await this.protectedAreasAsyncJob.sendFailedApiEventForStuckAsyncJob(
      projectId,
    );
  }
}
