import { ExportRequested } from '@marxan-api/modules/clone/export/domain';
import {
  ArchiveLocation,
  ComponentId,
  ComponentLocation,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { AggregateRoot } from '@nestjs/cqrs';
import { Either, left, right } from 'fp-ts/Either';
import { AllPiecesExported } from '../events/all-pieces-exported.event';
import { ArchiveReady } from '../events/archive-ready.event';
import { PieceExported } from '../events/piece-exported.event';
import { ExportComponentRequested } from '../events/export-component-requested.event';
import { ExportComponent } from './export-component/export-component';
import { ExportId } from './export.id';
import { ExportSnapshot } from './export.snapshot';

export const pieceNotFound = Symbol('export piece not found');
export const notReady = Symbol('some pieces of export are not yet ready');

export class Export extends AggregateRoot {
  private constructor(
    public readonly id: ExportId,
    public readonly resourceId: ResourceId,
    public readonly resourceKind: ResourceKind,
    private pieces: ExportComponent[],
    private archiveLocation?: ArchiveLocation,
  ) {
    super();
  }

  static newOne(
    id: ResourceId,
    kind: ResourceKind,
    parts: ExportComponent[],
  ): Export {
    const exportRequest = new Export(ExportId.create(), id, kind, parts);
    const allPieces = parts.map((part) => part.piece);
    parts
      .filter((part) => !part.isReady())
      .map(
        (part) =>
          new ExportComponentRequested(
            exportRequest.id,
            part.id,
            part.resourceId,
            kind,
            part.piece,
            allPieces,
          ),
      )
      .forEach((event) => exportRequest.apply(event));

    exportRequest.apply(
      new ExportRequested(
        exportRequest.id,
        exportRequest.resourceId,
        exportRequest.resourceKind,
      ),
    );
    return exportRequest;
  }

  completeComponent(
    id: ComponentId,
    pieceLocation: ComponentLocation[],
  ): Either<typeof pieceNotFound, true> {
    const piece = this.pieces.find((piece) => piece.id.equals(id));
    if (!piece) {
      return left(pieceNotFound);
    }
    piece.finish(pieceLocation);
    this.apply(new PieceExported(this.id, id, pieceLocation));

    if (this.#allPiecesReady()) {
      this.apply(new AllPiecesExported(this.id));
    }

    return right(true);
  }

  complete(archiveLocation: ArchiveLocation): Either<typeof notReady, true> {
    if (!this.#allPiecesReady()) {
      return left(notReady);
    }
    this.archiveLocation = archiveLocation;
    this.apply(
      new ArchiveReady(
        this.id,
        this.resourceId,
        this.resourceKind,
        this.archiveLocation,
      ),
    );
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
      snapshot.exportPieces.map(ExportComponent.fromSnapshot),
      snapshot.archiveLocation
        ? new ArchiveLocation(snapshot.archiveLocation)
        : undefined,
    );
  }

  #allPiecesReady = () => this.pieces.every((piece) => piece.isReady());
}
