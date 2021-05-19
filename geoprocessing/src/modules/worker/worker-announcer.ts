/**
 * in future PR, WorkerService will be extended to use
 * provided implementation of announcing job status
 *
 * in practice, it will be standalone module which manages
 * HTTP requests to API creating ApiEvents
 * Will be polished as it requires Topic+Kind as well
 */
export abstract class WorkerAnnouncer {
  abstract onStart(): void;

  abstract onError(): void;

  abstract onOnSuccess(): void;
}
