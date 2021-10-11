import { v4 } from 'uuid';
import { AggregateRoot } from '@nestjs/cqrs';
import { Either, left, right } from 'fp-ts/Either';

import { ResourceKind } from './resource.kind';
import { ExportId } from './export.id';
import { ResourceId } from './resource.id';
import { ArchiveLocation } from './archive-location';

import { ClonePartRequested } from '../events/clone-part-requested.event';
import { ClonePartsFinished } from '../events/clone-parts-finished.event';
import { ArchiveReady } from '../events/archive-ready.event';

import { PieceLocation } from './clone-part/piece-location';
import { ClonePart } from './clone-part/clone-part';
import { PieceId } from './clone-part/piece.id';
import { ExportSnapshot } from './export.snapshot';

export const pieceNotFound = Symbol('export piece not found');
export const notReady = Symbol('some pieces of export are not yet ready');

export class Export extends AggregateRoot {
  private constructor(
    public readonly id: ExportId,
    public readonly resourceId: ResourceId,
    public readonly resourceKind: ResourceKind,
    public readonly pieces: ClonePart[],
    private archiveLocation?: ArchiveLocation,
  ) {
    super();
  }

  static project(id: ResourceId, parts: ClonePart[]): Export {
    const exportRequest = new Export(
      new ExportId(v4()),
      id,
      ResourceKind.Project,
      parts,
    );

    exportRequest.apply(
      parts
        .filter((part) => !part.isReady())
        .map(
          (part) =>
            new ClonePartRequested(
              exportRequest.id,
              part.id,
              part.resourceId,
              part.piece,
            ),
        ),
    );

    return exportRequest;
  }

  completePiece(
    id: PieceId,
    pieceLocation: PieceLocation,
  ): Either<typeof pieceNotFound, true> {
    const piece = this.pieces.find((piece) => piece.id.equals(id));
    if (!piece) {
      return left(pieceNotFound);
    }
    piece.finish(pieceLocation);

    if (this.#allPiecesReady()) {
      this.apply(new ClonePartsFinished(this.id));
    }

    return right(true);
  }

  complete(archiveLocation: ArchiveLocation): Either<typeof notReady, true> {
    if (!this.#allPiecesReady()) {
      return left(notReady);
    }
    this.archiveLocation = archiveLocation;
    this.apply(new ArchiveReady(this.id, this.archiveLocation));
    return right(true);
  }

  toSnapshot(): ExportSnapshot {
    return {
      id: this.id.value,
      resourceId: this.resourceId.value,
      resourceKind: this.resourceKind,
      exportPieces: this.pieces.map((piece) => piece.toSnapshot()),
      archiveLocation: this.archiveLocation?.value,
    };
  }

  static fromSnapshot(snapshot: ExportSnapshot): Export {
    return new Export(
      new ExportId(snapshot.id),
      new ResourceId(snapshot.resourceId),
      snapshot.resourceKind,
      snapshot.exportPieces.map((piece) => ClonePart.fromSnapshot(piece)),
      snapshot.archiveLocation
        ? new ArchiveLocation(snapshot.archiveLocation)
        : undefined,
    );
  }

  #allPiecesReady = () => this.pieces.every((piece) => piece.isReady());
}
