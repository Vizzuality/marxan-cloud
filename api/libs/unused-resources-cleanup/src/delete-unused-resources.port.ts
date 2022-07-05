export abstract class DeleteUnsusedReosurces<T> {
  abstract removeUnusedResources(resourceId: string, data: T): Promise<void>;
}
