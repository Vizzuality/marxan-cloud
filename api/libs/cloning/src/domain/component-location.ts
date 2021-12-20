import { TinyType } from 'tiny-types';

/**
 * a URI pointing at the given Piece, whatever format it is
 */
export class ComponentLocation extends TinyType {
  constructor(
    public readonly uri: string,
    public readonly relativePath: string,
  ) {
    super();
  }
}
