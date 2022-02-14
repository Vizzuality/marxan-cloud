import { v4, validate } from 'uuid';

export class ResourceId {
  private readonly _token = 'resource-id';
  constructor(public readonly value: string) {
    const validUuid = validate(value);
    if (!validUuid) {
      throw new Error('Invalid resource id');
    }
  }

  static create(): ResourceId {
    return new ResourceId(v4());
  }

  equals(other: ResourceId): boolean {
    return this.value === other.value;
  }
}
