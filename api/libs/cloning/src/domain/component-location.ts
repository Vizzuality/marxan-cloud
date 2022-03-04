import { TinyType } from 'tiny-types';
import { ComponentLocationSnapshot } from '@marxan/cloning/domain/component-location.snapshot';

/**
 * a URI pointing at the given Piece, whatever format it is
 */
export class ComponentLocation extends TinyType {
  static fromSnapshot(snapshot: ComponentLocationSnapshot): ComponentLocation {
    return new ComponentLocation(snapshot.uri, snapshot.relativePath);
  }

  constructor(
    public readonly uri: string,
    public readonly relativePath: string,
  ) {
    super();
  }

  toSnapshot(): ComponentLocationSnapshot {
    return { uri: this.uri, relativePath: this.relativePath };
  }
}
