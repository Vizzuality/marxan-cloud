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
    readonly importId: ImportId,
    private readonly resourceId: ResourceId,
    private readonly resourceKind: ResourceKind,
    private readonly projectId: ResourceId,
    private readonly archiveLocation: ArchiveLocation,
    private readonly pieces: ImportComponent[],
  ) {
    super();

    const isProjectImport = resourceKind === ResourceKind.Project;
    const equalResourceAndProjectId = resourceId.equals(projectId);

    if (isProjectImport && !equalResourceAndProjectId) {
      throw new Error(
        'Project imports should have equal resource and project ids',
      );
    }

    if (!isProjectImport && equalResourceAndProjectId) {
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
      new ArchiveLocation(snapshot.archiveLocation),
      snapshot.importPieces.map(ImportComponent.fromSnapshot),
    );
  }

  static newOne(
    resourceId: ResourceId,
    kind: ResourceKind,
    projectId: ResourceId,
    archiveLocation: ArchiveLocation,
    pieces: ImportComponent[],
  ): Import {
    const id = ImportId.create();
    const instance = new Import(
      id,
      resourceId,
      kind,
      projectId,
      archiveLocation,
      pieces,
    );

    return instance;
  }

  run(): void {
    this.apply(
      new ImportRequested(this.importId, this.resourceId, this.resourceKind),
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

    this.apply(new PieceImported(this.importId, pieceId));

    pieceToComplete.complete();

    const isThisTheLastBatch = this.isLastBatch(pieceToComplete.order);
    const isThisBatchCompleted = this.isBatchReady(pieceToComplete.order);

    if (isThisTheLastBatch && isThisBatchCompleted)
      this.apply(new AllPiecesImported(this.importId));
    if (isThisTheLastBatch || !isThisBatchCompleted) return right(true);

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
    };
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

  private isBatchReady(order: number) {
    return this.pieces
      .filter((piece) => piece.order === order)
      .every((piece) => piece.isReady());
  }

  private isLastBatch(order: number) {
    return order === Math.max(...this.pieces.map((piece) => piece.order));
  }
}
