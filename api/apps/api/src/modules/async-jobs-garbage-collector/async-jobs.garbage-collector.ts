export interface AsyncJobsGarbageCollector {
  sendFailedApiEventsForStuckAsyncJobs(resourceId: string): Promise<void>;
}
