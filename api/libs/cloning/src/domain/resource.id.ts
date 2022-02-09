import { v4 } from 'uuid';

export class ResourceId {
  private readonly _token = 'resource-id';
  constructor(public readonly value: string) {}

  static create(): ResourceId {
    return new ResourceId(v4());
  }

  equals(other: ResourceId): boolean {
    return this.value === other.value;
  }
}
