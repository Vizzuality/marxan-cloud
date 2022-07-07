export abstract class CleanupTasks {
  abstract handleCron(): Promise<void>;
}
