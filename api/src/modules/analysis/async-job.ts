export enum JobStatus {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
}

export interface AsyncJob {
  id: string;
  status: JobStatus;
}
