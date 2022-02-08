import { AggregateRoot } from '@nestjs/cqrs';
import { ImportSnapshot } from './import.snapshot';
import { Either, left, right } from 'fp-ts/Either';
import {
  ArchiveLocation,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import {
  AllPiecesImported,
  ImportRequested,
  PieceImported,
  PieceImportRequested,
} from '../events';
import { ImportComponent } from '@marxan-api/modules/clone/import/domain/import/import-component';
import { ImportId } from '@marxan-api/modules/clone/import';

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
      snapshot.importPieces.map(ImportComponent.from),
    );
  }

  static new(data: Omit<ImportSnapshot, 'id'>): Import {
    const id = ImportId.create();
    const resourceId = new ResourceId(data.resourceId);
    const instance = new Import(
      id,
      resourceId,
      data.resourceKind,
      new ArchiveLocation(data.archiveLocation),
      data.importPieces.map(ImportComponent.from),
    );
    instance.apply(new ImportRequested(id, resourceId, data.resourceKind));
    instance.requestFirstBatch();
    return instance;
  }

  completePiece(
    piece: ImportComponent,
  ): Either<CompletePieceErrors, CompletePieceSuccess> {
    const pieceToComplete = this.pieces.find(
      (pc) => pc.id.value === piece.id.value,
    );
    if (!pieceToComplete) return left(componentNotFound);
    if (pieceToComplete.isFinished()) return left(componentAlreadyCompleted);

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

    if (isThisTheLastBatch) this.apply(new AllPiecesImported());
    if (isThisTheLastBatch || !isThisBatchCompleted) return right(true);

    const nextBatch = this.pieces.filter(
      (piece) => piece.order === pieceToComplete.order + 1,
    );

    for (const nextPiece of nextBatch) {
      this.apply(
        new PieceImportRequested(
          nextPiece.id,
          nextPiece.piece,
          nextPiece.resourceId,
          nextPiece.uris,
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
      this.apply(new AllPiecesImported());
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
          component.id,
          component.piece,
          component.resourceId,
          component.uris,
        ),
      );
    }
  }
}
