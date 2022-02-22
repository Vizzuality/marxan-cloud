import { v4 } from 'uuid';

export class ComponentId {
  private readonly _token = 'component-id';
  constructor(public readonly value: string) {}

  static create(): ComponentId {
    return new ComponentId(v4());
  }

  equals(other: ComponentId): boolean {
    return this.value === other.value;
  }
}
