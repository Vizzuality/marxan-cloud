import { ResourceId } from '@marxan/cloning/domain';
import { UserId } from '@marxan/domain-ids';
import {
  LegacyProjectImportFile,
  LegacyProjectImportFileType,
  LegacyProjectImportPiece,
} from '@marxan/legacy-project-import';
import { LegacyProjectImportFileId } from '@marxan/legacy-project-import/domain/legacy-project-import-file.id';
import { AggregateRoot } from '@nestjs/cqrs';
import { Either, isLeft, left, right } from 'fp-ts/Either';
import { AllLegacyProjectImportPiecesImported } from '../events/all-legacy-project-import-pieces-imported.event';
import { LegacyProjectImportCanceled } from '../events/legacy-project-import-canceled.events';
import { LegacyProjectImportBatchFailed } from '../events/legacy-project-import-batch-failed.event';
import { LegacyProjectImportPieceImported } from '../events/legacy-project-import-piece-imported.event';
import { LegacyProjectImportPieceRequested } from '../events/legacy-project-import-piece-requested.event';
import { LegacyProjectImportRequested } from '../events/legacy-project-import-requested.event';
import { LegacyProjectImportComponent } from './legacy-project-import-component';
import { LegacyProjectImportComponentId } from './legacy-project-import-component.id';
import { LegacyProjectImportStatus } from './legacy-project-import-status';
import { LegacyProjectImportId } from './legacy-project-import.id';
import { LegacyProjectImportSnapshot } from './legacy-project-import.snapshot';
export const legacyProjectImportComponentNotFound = Symbol(
  `legacy project import component not found`,
);
export const legacyProjectImportComponentAlreadyCompleted = Symbol(
  `legacy project import component already completed`,
);
export const legacyProjectImportComponentAlreadyFailed = Symbol(
  `legacy project import component already failed`,
);
export const legacyProjectImportMissingRequiredFile = Symbol(
  `legacy project import missing required file`,
);
export const legacyProjectImportAlreadyStarted = Symbol(
  `legacy project import already started`,
);

export const legacyProjectImportAlreadyFinished = Symbol(
  `legacy project import already finished`,
);

export type CompleteLegacyProjectImportPieceSuccess = true;
export type CompleteLegacyProjectImportPieceErrors =
  | typeof legacyProjectImportComponentNotFound
  | typeof legacyProjectImportComponentAlreadyCompleted;
export type MarkLegacyProjectImportPieceAsFailedErrors =
  | typeof legacyProjectImportComponentNotFound
  | typeof legacyProjectImportComponentAlreadyFailed;

export type AddFileToLegacyProjectImportErrors =
  typeof legacyProjectImportAlreadyStarted;
export type DeleteFileFromLegacyProjectImportErrors =
  typeof legacyProjectImportAlreadyStarted;

export type GenerateLegacyProjectImportPiecesErrors =
  typeof legacyProjectImportMissingRequiredFile;

export type RunLegacyProjectImportErrors =
  | typeof legacyProjectImportAlreadyStarted
  | GenerateLegacyProjectImportPiecesErrors;

export type HaltLegacyProjectImportErros =
  typeof legacyProjectImportAlreadyFinished;

export class LegacyProjectImport extends AggregateRoot {
  private constructor(
    readonly id: LegacyProjectImportId,
    private readonly projectId: ResourceId,
    private readonly scenarioId: ResourceId,
    private readonly ownerId: UserId,
    private status: LegacyProjectImportStatus = LegacyProjectImportStatus.create(),
    private pieces: LegacyProjectImportComponent[] = [],
    private readonly files: LegacyProjectImportFile[] = [],
    private toBeRemoved: boolean = false,
  ) {
    super();
  }

  static fromSnapshot(
    snapshot: LegacyProjectImportSnapshot,
  ): LegacyProjectImport {
    return new LegacyProjectImport(
      new LegacyProjectImportId(snapshot.id),
      new ResourceId(snapshot.projectId),
      new ResourceId(snapshot.scenarioId),
      new UserId(snapshot.ownerId),
      LegacyProjectImportStatus.fromSnapshot(snapshot.status),
      snapshot.pieces.map(LegacyProjectImportComponent.fromSnapshot),
      snapshot.files.map(LegacyProjectImportFile.fromSnapshot),
      snapshot.toBeRemoved,
    );
  }

  static newOne(
    projectId: ResourceId,
    scenarioId: ResourceId,
    ownerId: UserId,
  ): LegacyProjectImport {
    return new LegacyProjectImport(
      LegacyProjectImportId.create(),
      projectId,
      scenarioId,
      ownerId,
    );
  }

  private requestFirstBatch() {
    const firstBatchOrder = Math.min(
      ...this.pieces.map((piece) => piece.order),
    );

    for (const component of this.pieces.filter(
      (pc) => pc.order === firstBatchOrder,
    )) {
      this.apply(
        new LegacyProjectImportPieceRequested(this.projectId, component.id),
      );
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

  public importProcessAlreadyStarted() {
    return !this.status.isAcceptingFiles();
  }

  public hasImportedLegacyProject() {
    return this.status.hasCompleted();
  }

  public areRequiredFilesUploaded(): boolean {
    const requiredFilesTypes = [
      LegacyProjectImportFileType.PlanningGridShapefile,
      LegacyProjectImportFileType.InputDat,
      LegacyProjectImportFileType.PuDat,
      LegacyProjectImportFileType.PuvsprDat,
      LegacyProjectImportFileType.SpecDat,
    ];
    const filesTypes = this.files.map((file) => file.type);

    return requiredFilesTypes.every((type) => filesTypes.includes(type));
  }

  private generatePieces(): Either<
    GenerateLegacyProjectImportPiecesErrors,
    LegacyProjectImportComponent[]
  > {
    const areRequiredFilesPresent = this.areRequiredFilesUploaded();
    if (!areRequiredFilesPresent)
      return left(legacyProjectImportMissingRequiredFile);

    const pieces: LegacyProjectImportComponent[] = [
      LegacyProjectImportComponent.newOne(
        LegacyProjectImportPiece.PlanningGrid,
      ),
      LegacyProjectImportComponent.newOne(LegacyProjectImportPiece.Input),
      LegacyProjectImportComponent.newOne(
        LegacyProjectImportPiece.ScenarioPusData,
      ),
      LegacyProjectImportComponent.newOne(LegacyProjectImportPiece.Features),
      LegacyProjectImportComponent.newOne(
        LegacyProjectImportPiece.FeaturesSpecification,
      ),
    ];

    const solutionsFile = this.files.find(
      (file) => file.type === LegacyProjectImportFileType.Output,
    );
    if (solutionsFile) {
      pieces.push(
        LegacyProjectImportComponent.newOne(LegacyProjectImportPiece.Solutions),
      );
    }

    return right(pieces);
  }

  run(): Either<RunLegacyProjectImportErrors, true> {
    if (this.importProcessAlreadyStarted())
      return left(legacyProjectImportAlreadyStarted);

    this.status = this.status.markAsRunning();
    const piecesOrError = this.generatePieces();

    if (isLeft(piecesOrError)) return piecesOrError;

    this.pieces = piecesOrError.right;

    this.apply(new LegacyProjectImportRequested(this.projectId));
    this.requestFirstBatch();

    return right(true);
  }

  markPieceAsFailed(
    pieceId: LegacyProjectImportComponentId,
    errors: string[] = [],
  ): Either<MarkLegacyProjectImportPieceAsFailedErrors, true> {
    const piece = this.pieces.find((pc) => pc.id.value === pieceId.value);
    if (!piece) return left(legacyProjectImportComponentNotFound);
    if (piece.hasFailed())
      return left(legacyProjectImportComponentAlreadyFailed);

    piece.markAsFailed(errors);

    const hasThisBatchFinished = this.hasBatchFinished(piece.order);
    const hasThisBatchFailed = this.hasBatchFailed(piece.order);

    if (hasThisBatchFinished && hasThisBatchFailed) {
      this.status = this.status.markAsFailed();
      this.apply(
        new LegacyProjectImportBatchFailed(this.projectId, piece.order),
      );
    }

    return right(true);
  }

  completePiece(
    pieceId: LegacyProjectImportComponentId,
    warnings?: string[],
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

    this.apply(new LegacyProjectImportPieceImported(this.projectId, pieceId));

    pieceToComplete.complete(warnings);

    const isThisTheLastBatch = this.isLastBatch(pieceToComplete.order);
    const hasThisBatchFinished = this.hasBatchFinished(pieceToComplete.order);
    const hasThisBatchFailed = this.hasBatchFailed(pieceToComplete.order);
    const haltImportProcess = this.toBeRemoved;

    if (hasThisBatchFinished && hasThisBatchFailed) {
      this.status = this.status.markAsFailed();
      this.apply(
        new LegacyProjectImportBatchFailed(
          this.projectId,
          pieceToComplete.order,
        ),
      );
      return right(true);
    }

    if (hasThisBatchFinished && haltImportProcess) {
      this.status = this.status.markAsCanceled();
      this.apply(new LegacyProjectImportCanceled(this.projectId));
      return right(true);
    }
    if (hasThisBatchFinished && isThisTheLastBatch) {
      this.status = this.status.markAsCompleted();
      this.apply(new AllLegacyProjectImportPiecesImported(this.projectId));
    }
    if (isThisTheLastBatch || !hasThisBatchFinished) return right(true);

    const nextBatch = this.pieces.filter(
      (piece) => piece.order === pieceToComplete.order + 1,
    );

    for (const component of nextBatch) {
      this.apply(
        new LegacyProjectImportPieceRequested(this.projectId, component.id),
      );
    }

    return right(true);
  }

  toSnapshot(): LegacyProjectImportSnapshot {
    return {
      id: this.id.value,
      projectId: this.projectId.value,
      scenarioId: this.scenarioId.value,
      ownerId: this.ownerId.value,
      status: this.status.toSnapshot(),
      pieces: this.pieces.map((piece) => piece.toSnapshot()),
      files: this.files.map((file) => file.toSnapshot()),
      toBeRemoved: this.toBeRemoved,
    };
  }

  addFile(
    file: LegacyProjectImportFile,
  ): Either<AddFileToLegacyProjectImportErrors, true> {
    if (this.importProcessAlreadyStarted()) {
      return left(legacyProjectImportAlreadyStarted);
    }

    const sameFileTypeFileIndex = this.files.findIndex(
      (el) => el.type === file.type,
    );

    if (sameFileTypeFileIndex !== -1) {
      this.files.splice(sameFileTypeFileIndex, 1);
    }

    this.files.push(file);

    return right(true);
  }

  deleteFile(
    fileId: LegacyProjectImportFileId,
  ): Either<
    DeleteFileFromLegacyProjectImportErrors,
    LegacyProjectImportFile | undefined
  > {
    if (this.importProcessAlreadyStarted()) {
      return left(legacyProjectImportAlreadyStarted);
    }

    const fileIndex = this.files.findIndex((file) => file.id.equals(fileId));

    if (fileIndex === -1) return right(undefined);

    const [deletedFile] = this.files.splice(fileIndex, 1);

    return right(deletedFile);
  }

  getPiecesWithErrorsOrWarnings(): LegacyProjectImportComponent[] {
    return this.pieces.filter(
      (piece) => piece.hasWarnings() || piece.hasErrors(),
    );
  }

  haltLegacyProjectImport() {
    if (this.status.hasFailed() || this.status.hasCompleted())
      return left(legacyProjectImportAlreadyFinished);

    if (this.status.isAcceptingFiles()) {
      this.status = this.status.markAsCanceled();
    }

    this.toBeRemoved = true;
    return right(true);
  }
}
