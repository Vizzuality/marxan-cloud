import {
  ArchiveLocation,
  ComponentId,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { AggregateRoot } from '@nestjs/cqrs';
import { Either, left, right } from 'fp-ts/Either';
import { AllPiecesImported } from '../events/all-pieces-imported.event';
import { ImportRequested } from '../events/import-requested.event';
import { PieceImportRequested } from '../events/piece-import-requested.event';
import { PieceImported } from '../events/piece-imported.event';
import { ImportComponent } from './import-component';
import { ImportId } from './import.id';
import { ImportSnapshot } from './import.snapshot';

export const componentNotFound = Symbol(`component not found`);
export const componentAlreadyCompleted = Symbol(`component already completed`);

export type CompletePieceSuccess = true;
export type CompletePieceErrors =
  | typeof componentNotFound
  | typeof componentAlreadyCompleted;

export class Import extends AggregateRoot {
  private constructor(
    readonly id: ImportId,
    private readonly resourceId: ResourceId,
    private readonly resourceKind: ResourceKind,
    private readonly archiveLocation: ArchiveLocation,
    private readonly pieces: ImportComponent[],
  ) {
    super();
  }

  static fromSnapshot(snapshot: ImportSnapshot): Import {
    return new Import(
      new ImportId(snapshot.id),
      new ResourceId(snapshot.resourceId),
      snapshot.resourceKind,
      new ArchiveLocation(snapshot.archiveLocation),
      snapshot.importPieces.map(ImportComponent.fromSnapshot),
    );
  }

  static newOne(
    resourceId: ResourceId,
    kind: ResourceKind,
    archiveLocation: ArchiveLocation,
    pieces: ImportComponent[],
  ): Import {
    const id = ImportId.create();
    const instance = new Import(id, resourceId, kind, archiveLocation, pieces);

    return instance;
  }

  run(): void {
    this.apply(
      new ImportRequested(this.id, this.resourceId, this.resourceKind),
    );
    this.requestFirstBatch();
  }

  completePiece(
    pieceId: ComponentId,
  ): Either<CompletePieceErrors, CompletePieceSuccess> {
    const pieceToComplete = this.pieces.find(
      (pc) => pc.id.value === pieceId.value,
    );
    if (!pieceToComplete) return left(componentNotFound);
    if (pieceToComplete.isReady()) return left(componentAlreadyCompleted);

    this.apply(
      new PieceImported(
        pieceToComplete.id,
        pieceToComplete.piece,
        pieceToComplete.resourceId,
      ),
    );

    pieceToComplete.complete();

    const isThisTheLastBatch = false;
    const isThisBatchCompleted = false;

    if (isThisTheLastBatch)
      this.apply(
        new AllPiecesImported(this.id, this.resourceId, this.resourceKind),
      );
    if (isThisTheLastBatch || !isThisBatchCompleted) return right(true);

    const nextBatch = this.pieces.filter(
      (piece) => piece.order === pieceToComplete.order + 1,
    );

    for (const component of nextBatch) {
      this.apply(
        new PieceImportRequested(
          this.id,
          component.id,
          component.piece,
          component.resourceId,
          this.resourceKind,
          component.uris,
        ),
      );
    }

    return right(true);
  }

  toSnapshot(): ImportSnapshot {
    return {
      id: this.id.value,
      resourceId: this.resourceId.value,
      resourceKind: this.resourceKind,
      importPieces: this.pieces.map((piece) => piece.toSnapshot()),
      archiveLocation: this.archiveLocation.value,
    };
  }

  private requestFirstBatch() {
    if (this.pieces.length === 0) {
      this.apply(
        new AllPiecesImported(this.id, this.resourceId, this.resourceKind),
      );
      return;
    }
    const firstBatchOrder = Math.min(
      ...this.pieces.map((piece) => piece.order),
    );

    for (const component of this.pieces.filter(
      (pc) => pc.order === firstBatchOrder,
    )) {
      this.apply(
        new PieceImportRequested(
          this.id,
          component.id,
          component.piece,
          component.resourceId,
          this.resourceKind,
          component.uris,
        ),
      );
    }
  }
}
