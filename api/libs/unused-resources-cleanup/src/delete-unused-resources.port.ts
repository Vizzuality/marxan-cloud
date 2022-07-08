export abstract class UnusedResources<T> {
  abstract removeUnusedResources(resourceId: string, data: T): Promise<void>;
}
