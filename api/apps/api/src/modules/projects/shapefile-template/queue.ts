export abstract class Queue {
  abstract isPending(scenarioId: string): Promise<boolean>;

  abstract startProcessing(scenarioId: string): void;
}
