import { v4 } from 'uuid';
import { ClonePiece } from '../../../../shared-kernel/clone-piece';

import { ResourceId } from '../resource.id';
import { ClonePartSnapshot } from '../clone-part.snapshot';

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

  toSnapshot(): ClonePartSnapshot {
    return {
      id: this.id.value,
      piece: this.piece,
      resourceId: this.resourceId.value,
      finished: this.finished,
      uri: this.uri?.value,
    };
  }

  static fromSnapshot(snapshot: ClonePartSnapshot) {
    return new ClonePart(
      new PieceId(snapshot.id),
      snapshot.piece,
      new ResourceId(snapshot.resourceId),
      snapshot.finished,
      snapshot.uri ? new PieceLocation(snapshot.uri) : undefined,
    );
  }
}
