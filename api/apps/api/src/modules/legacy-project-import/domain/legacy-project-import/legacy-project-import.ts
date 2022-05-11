import { ResourceId } from '@marxan/cloning/domain';
import { UserId } from '@marxan/domain-ids';
import { AggregateRoot } from '@nestjs/cqrs';
import { Either, left, right } from 'fp-ts/Either';
import { AllLegacyProjectPiecesImported } from '../events/all-legacy-project-import-pieces-imported.event';
import { LegacyProjectImportBatchFailed } from '../events/legacy-project-import-batch-failed.event';
import { LegacyProjectImportPieceImported } from '../events/legacy-project-import-piece-imported.event';
import { LegacyProjectImportPieceRequested } from '../events/legacy-project-import-piece-requested.event';
import { LegacyProjectImportRequested } from '../events/legacy-project-import-requested.event';
import { LegacyProjectImportSnapshot } from './legacy-projec-import.snapshot';
import { LegacyProjectImportComponent } from './legacy-project-import-component';
import { LegacyProjectImportComponentId } from './legacy-project-import-component.id';
import { LegacyProjectImportId } from './legacy-project-import.id';

export const legacyProjectImportComponentNotFound = Symbol(
  `legacy project import component not found`,
);
export const legacyProjectImportComponentAlreadyCompleted = Symbol(
  `legacy project import component already completed`,
);
export const legacyProjectImportComponentAlreadyFailed = Symbol(
  `legacy project import component already failed`,
);

export type CompleteLegacyProjectImportPieceSuccess = true;
export type CompleteLegacyProjectImportPieceErrors =
  | typeof legacyProjectImportComponentNotFound
  | typeof legacyProjectImportComponentAlreadyCompleted;
export type MarkLegacyProjectImportPieceAsFailedErrors =
  | typeof legacyProjectImportComponentNotFound
  | typeof legacyProjectImportComponentAlreadyFailed;

export class LegacyProjectImport extends AggregateRoot {
  private constructor(
    readonly id: LegacyProjectImportId,
    private readonly projectId: ResourceId,
    private readonly ownerId: UserId,
    private readonly pieces: LegacyProjectImportComponent[],
  ) {
    super();
  }

  static fromSnapshot(
    snapshot: LegacyProjectImportSnapshot,
  ): LegacyProjectImport {
    return new LegacyProjectImport(
      new LegacyProjectImportId(snapshot.id),
      new ResourceId(snapshot.projectId),
      new UserId(snapshot.ownerId),
      snapshot.pieces.map(LegacyProjectImportComponent.fromSnapshot),
    );
  }

  static newOne(
    projectId: ResourceId,
    ownerId: UserId,
    pieces: LegacyProjectImportComponent[],
  ): LegacyProjectImport {
    return new LegacyProjectImport(
      LegacyProjectImportId.create(),
      projectId,
      ownerId,
      pieces,
    );
  }

  private requestFirstBatch() {
    const firstBatchOrder = Math.min(
      ...this.pieces.map((piece) => piece.order),
    );

    for (const component of this.pieces.filter(
      (pc) => pc.order === firstBatchOrder,
    )) {
      this.apply(new LegacyProjectImportPieceRequested(this.id, component.id));
    }
  }

  private hasBatchFinished(order: number) {
    return this.pieces
      .filter((piece) => piece.order === order)
      .every((piece) => piece.isReady() || piece.hasFailed());
  }

  private isLastBatch(order: number) {
    return order === Math.max(...this.pieces.map((piece) => piece.order));
  }

  private hasBatchFailed(order: number) {
    return this.pieces
      .filter((piece) => piece.order === order)
      .some((piece) => piece.hasFailed());
  }

  start(): void {
    this.apply(new LegacyProjectImportRequested(this.id, this.projectId));
    this.requestFirstBatch();
  }

  markPieceAsFailed(
    pieceId: LegacyProjectImportComponentId,
  ): Either<MarkLegacyProjectImportPieceAsFailedErrors, true> {
    const piece = this.pieces.find((pc) => pc.id.value === pieceId.value);
    if (!piece) return left(legacyProjectImportComponentNotFound);
    if (piece.hasFailed())
      return left(legacyProjectImportComponentAlreadyFailed);

    piece.markAsFailed();

    const hasThisBatchFinished = this.hasBatchFinished(piece.order);
    const hasThisBatchFailed = this.hasBatchFailed(piece.order);

    if (hasThisBatchFinished && hasThisBatchFailed) {
      this.apply(new LegacyProjectImportBatchFailed(this.id, piece.order));
    }

    return right(true);
  }

  completePiece(
    pieceId: LegacyProjectImportComponentId,
  ): Either<
    CompleteLegacyProjectImportPieceErrors,
    CompleteLegacyProjectImportPieceSuccess
  > {
    const pieceToComplete = this.pieces.find(
      (pc) => pc.id.value === pieceId.value,
    );
    if (!pieceToComplete) return left(legacyProjectImportComponentNotFound);
    if (pieceToComplete.isReady())
      return left(legacyProjectImportComponentAlreadyCompleted);

    this.apply(new LegacyProjectImportPieceImported(this.id, pieceId));

    pieceToComplete.complete();

    const isThisTheLastBatch = this.isLastBatch(pieceToComplete.order);
    const hasThisBatchFinished = this.hasBatchFinished(pieceToComplete.order);
    const hasThisBatchFailed = this.hasBatchFailed(pieceToComplete.order);

    if (hasThisBatchFinished && hasThisBatchFailed) {
      this.apply(
        new LegacyProjectImportBatchFailed(this.id, pieceToComplete.order),
      );
      return right(true);
    }

    if (isThisTheLastBatch && hasThisBatchFinished)
      this.apply(new AllLegacyProjectPiecesImported(this.id, this.projectId));
    if (isThisTheLastBatch || !hasThisBatchFinished) return right(true);

    const nextBatch = this.pieces.filter(
      (piece) => piece.order === pieceToComplete.order + 1,
    );

    for (const component of nextBatch) {
      this.apply(new LegacyProjectImportPieceRequested(this.id, component.id));
    }

    return right(true);
  }

  toSnapshot(): LegacyProjectImportSnapshot {
    return {
      id: this.id.value,
      pieces: this.pieces.map((piece) => piece.toSnapshot()),
      projectId: this.projectId.value,
      ownerId: this.ownerId.value,
    };
  }
}
