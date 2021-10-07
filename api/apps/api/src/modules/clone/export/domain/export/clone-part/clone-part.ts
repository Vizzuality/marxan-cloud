import { v4 } from 'uuid';
import { ClonePiece } from '../../../../shared-kernel/clone-piece';
import { ResourceId } from '../resource.id';
import { PieceId } from './piece.id';
import { PieceLocation } from './piece-location';

export class ClonePart {
  private constructor(
    readonly id: PieceId,
    readonly piece: ClonePiece,
    readonly resourceId: ResourceId,
    private finished: boolean = false,
    private uri?: PieceLocation,
  ) {}

  static newOne(resourceId: ResourceId, piece: ClonePiece): ClonePart {
    return new ClonePart(new PieceId(v4()), piece, resourceId);
  }

  finish(location: PieceLocation) {
    this.finished = true;
    this.uri = location;
  }

  isReady() {
    return this.finished;
  }

  // TODO
  toSnapshot() {
    return {};
  }

  // TODO
  static fromSnapshot() {}
}
