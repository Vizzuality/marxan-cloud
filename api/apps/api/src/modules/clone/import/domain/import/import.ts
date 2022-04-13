import {
  ArchiveLocation,
  ComponentId,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { AggregateRoot } from '@nestjs/cqrs';
import { Either, left, right } from 'fp-ts/Either';
import { UserId } from '@marxan/domain-ids';
import { AllPiecesImported } from '../events/all-pieces-imported.event';
import { ImportBatchFailed } from '../events/import-batch-failed.event';
import { ImportRequested } from '../events/import-requested.event';
import { PieceImportRequested } from '../events/piece-import-requested.event';
import { PieceImported } from '../events/piece-imported.event';
import { ImportComponent } from './import-component';
import { ImportId } from './import.id';
import { ImportSnapshot } from './import.snapshot';

export const componentNotFound = Symbol(`component not found`);
export const componentAlreadyCompleted = Symbol(`component already completed`);
export const componentAlreadyFailed = Symbol(`component already failed`);

export type CompletePieceSuccess = true;
export type CompletePieceErrors =
  | typeof componentNotFound
  | typeof componentAlreadyCompleted;
export type MarkPieceAsFailedErrors =
  | typeof componentNotFound
  | typeof componentAlreadyFailed;

export class Import extends AggregateRoot {
  private constructor(
    readonly importId: ImportId,
    private readonly resourceId: ResourceId,
    private readonly resourceKind: ResourceKind,
    private readonly projectId: ResourceId,
    private readonly ownerId: UserId,
    private readonly archiveLocation: ArchiveLocation,
    private readonly pieces: ImportComponent[],
    private readonly isCloning: boolean,
  ) {
    super();

    const isProjectImport = resourceKind === ResourceKind.Project;
    const resourceIdAndProjectIdAreEqual = resourceId.equals(projectId);

    if (isProjectImport && !resourceIdAndProjectIdAreEqual) {
      throw new Error(
        'Project imports should have equal resource and project ids',
      );
    }

    if (!isProjectImport && resourceIdAndProjectIdAreEqual) {
      throw new Error(
        'Scenario imports should have distinct resource and project ids',
      );
    }
  }

  static fromSnapshot(snapshot: ImportSnapshot): Import {
    return new Import(
      new ImportId(snapshot.id),
      new ResourceId(snapshot.resourceId),
      snapshot.resourceKind,
      new ResourceId(snapshot.projectId),
      new UserId(snapshot.ownerId),
      new ArchiveLocation(snapshot.archiveLocation),
      snapshot.importPieces.map(ImportComponent.fromSnapshot),
      snapshot.isCloning,
    );
  }

  static newOne(
    resourceId: ResourceId,
    kind: ResourceKind,
    projectId: ResourceId,
    ownerId: UserId,
    archiveLocation: ArchiveLocation,
    pieces: ImportComponent[],
    isCloning: boolean,
  ): Import {
    const id = ImportId.create();
    const instance = new Import(
      id,
      resourceId,
      kind,
      projectId,
      ownerId,
      archiveLocation,
      pieces,
      isCloning,
    );

    return instance;
  }

  private requestFirstBatch() {
    const firstBatchOrder = Math.min(
      ...this.pieces.map((piece) => piece.order),
    );

    for (const component of this.pieces.filter(
      (pc) => pc.order === firstBatchOrder,
    )) {
      this.apply(new PieceImportRequested(this.importId, component.id));
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

  run(): void {
    this.apply(
      new ImportRequested(this.importId, this.resourceId, this.resourceKind),
    );
    this.requestFirstBatch();
  }

  markPieceAsFailed(
    pieceId: ComponentId,
  ): Either<MarkPieceAsFailedErrors, true> {
    const piece = this.pieces.find((pc) => pc.id.value === pieceId.value);
    if (!piece) return left(componentNotFound);
    if (piece.hasFailed()) return left(componentAlreadyFailed);

    piece.markAsFailed();

    const hasThisBatchFinished = this.hasBatchFinished(piece.order);
    const hasThisBatchFailed = this.hasBatchFailed(piece.order);

    if (hasThisBatchFinished && hasThisBatchFailed) {
      this.apply(new ImportBatchFailed(this.importId, piece.order));
    }

    return right(true);
  }

  completePiece(
    pieceId: ComponentId,
  ): Either<CompletePieceErrors, CompletePieceSuccess> {
    const pieceToComplete = this.pieces.find(
      (pc) => pc.id.value === pieceId.value,
    );
    if (!pieceToComplete) return left(componentNotFound);
    if (pieceToComplete.isReady()) return left(componentAlreadyCompleted);

    this.apply(new PieceImported(this.importId, pieceId));

    pieceToComplete.complete();

    const isThisTheLastBatch = this.isLastBatch(pieceToComplete.order);
    const hasThisBatchFinished = this.hasBatchFinished(pieceToComplete.order);
    const hasThisBatchFailed = this.hasBatchFailed(pieceToComplete.order);

    if (hasThisBatchFinished && hasThisBatchFailed) {
      this.apply(new ImportBatchFailed(this.importId, pieceToComplete.order));
      return right(true);
    }

    if (isThisTheLastBatch && hasThisBatchFinished)
      this.apply(
        new AllPiecesImported(
          this.importId,
          this.resourceId,
          this.resourceKind,
          this.isCloning,
        ),
      );
    if (isThisTheLastBatch || !hasThisBatchFinished) return right(true);

    const nextBatch = this.pieces.filter(
      (piece) => piece.order === pieceToComplete.order + 1,
    );

    for (const component of nextBatch) {
      this.apply(new PieceImportRequested(this.importId, component.id));
    }

    return right(true);
  }

  toSnapshot(): ImportSnapshot {
    return {
      id: this.importId.value,
      resourceId: this.resourceId.value,
      resourceKind: this.resourceKind,
      importPieces: this.pieces.map((piece) => piece.toSnapshot()),
      archiveLocation: this.archiveLocation.value,
      projectId: this.projectId.value,
      ownerId: this.ownerId.value,
      isCloning: this.isCloning,
    };
  }
}
