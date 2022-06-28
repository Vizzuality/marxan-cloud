export abstract class DeleteUnusedResources<T> {
  abstract removeUnusedResources(resourceId: string, data: T): Promise<void>;
}
