import { v4 } from 'uuid';
import { AggregateRoot } from '@nestjs/cqrs';
import { Either, left, right } from 'fp-ts/Either';

import { ResourceKind } from './resource.kind';
import { ExportId } from './export.id';
import { ResourceId } from './resource.id';
import { ArchiveLocation } from './archive-location';

import { ExportComponentRequested } from '../events/export-component-requested.event';
import { ExportComponentFinished } from '../events/export-component-finished.event';
import { ArchiveReady } from '../events/archive-ready.event';

import { ComponentLocation } from './export-component/component-location';
import { ExportComponent } from './export-component/export-component';
import { ComponentId } from './export-component/component.id';
import { ExportSnapshot } from './export.snapshot';

export const pieceNotFound = Symbol('export piece not found');
export const notReady = Symbol('some pieces of export are not yet ready');

export class Export extends AggregateRoot {
  private constructor(
    public readonly id: ExportId,
    public readonly resourceId: ResourceId,
    public readonly resourceKind: ResourceKind,
    public readonly pieces: ExportComponent[],
    private archiveLocation?: ArchiveLocation,
  ) {
    super();
  }

  static project(id: ResourceId, parts: ExportComponent[]): Export {
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
            new ExportComponentRequested(
              exportRequest.id,
              part.id,
              part.resourceId,
              part.piece,
            ),
        ),
    );

    return exportRequest;
  }

  completeComponent(
    id: ComponentId,
    pieceLocation: ComponentLocation,
  ): Either<typeof pieceNotFound, true> {
    const piece = this.pieces.find((piece) => piece.id.equals(id));
    if (!piece) {
      return left(pieceNotFound);
    }
    piece.finish(pieceLocation);

    if (this.#allPiecesReady()) {
      this.apply(new ExportComponentFinished(this.id));
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
      snapshot.exportPieces.map((piece) => ExportComponent.fromSnapshot(piece)),
      snapshot.archiveLocation
        ? new ArchiveLocation(snapshot.archiveLocation)
        : undefined,
    );
  }

  #allPiecesReady = () => this.pieces.every((piece) => piece.isReady());
}
