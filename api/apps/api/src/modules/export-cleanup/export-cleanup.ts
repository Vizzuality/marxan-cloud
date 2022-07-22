export abstract class ExportCleanup {
  abstract handleCron(): Promise<void>;
}
