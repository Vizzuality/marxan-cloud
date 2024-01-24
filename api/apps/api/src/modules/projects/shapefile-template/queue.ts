export abstract class Queue {
  abstract isPending(projectId: string): Promise<boolean>;

  abstract startProcessing(projectId: string): void;
}
