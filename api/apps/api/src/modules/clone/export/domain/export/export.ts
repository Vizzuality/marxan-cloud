import { v4 } from 'uuid';
import { AggregateRoot } from '@nestjs/cqrs';

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

  completePiece(id: PieceId, pieceLocation: PieceLocation) {
    const piece = this.pieces.find((piece) => piece.id.equals(id));

    // TODO throw
    piece?.finish(pieceLocation);

    if (this.#allPiecesReady()) {
      this.apply(new ClonePartsFinished(this.id));
    }
  }

  complete(archiveLocation: ArchiveLocation) {
    this.archiveLocation = archiveLocation;
    this.apply(new ArchiveReady(this.id, this.archiveLocation));
  }

  toSnapshot() {
    //
  }

  static fromSnapshot() {
    //
  }

  #allPiecesReady = () => this.pieces.every((piece) => piece.isReady());
}
