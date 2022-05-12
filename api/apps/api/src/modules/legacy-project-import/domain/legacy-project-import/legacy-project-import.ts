import { ArchiveLocation, ResourceId } from '@marxan/cloning/domain';
import { UserId } from '@marxan/domain-ids';
import {
  LegacyProjectImportFile,
  LegacyProjectImportFileType,
  LegacyProjectImportPiece,
} from '@marxan/legacy-project-import';
import { AggregateRoot } from '@nestjs/cqrs';
import { Either, isLeft, left, right } from 'fp-ts/Either';
import { AllLegacyProjectPiecesImported } from '../events/all-legacy-project-import-pieces-imported.event';
import { LegacyProjectImportBatchFailed } from '../events/legacy-project-import-batch-failed.event';
import { LegacyProjectImportPieceImported } from '../events/legacy-project-import-piece-imported.event';
import { LegacyProjectImportPieceRequested } from '../events/legacy-project-import-piece-requested.event';
import { LegacyProjectImportRequested } from '../events/legacy-project-import-requested.event';
import { LegacyProjectImportComponent } from './legacy-project-import-component';
import { LegacyProjectImportComponentId } from './legacy-project-import-component.id';
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
export const legacyProjectImportDuplicateFile = Symbol(
  `legacy project import already has this file`,
);
export const legacyProjectImportDuplicateFileType = Symbol(
  `legacy project import already has this file type`,
);
export const legacyProjectImportMissingRequiredFile = Symbol(
  `legacy project import missing required file`,
);

export type CompleteLegacyProjectImportPieceSuccess = true;
export type CompleteLegacyProjectImportPieceErrors =
  | typeof legacyProjectImportComponentNotFound
  | typeof legacyProjectImportComponentAlreadyCompleted;
export type MarkLegacyProjectImportPieceAsFailedErrors =
  | typeof legacyProjectImportComponentNotFound
  | typeof legacyProjectImportComponentAlreadyFailed;

export type AddFileToLegacyProjectImportErrors =
  | typeof legacyProjectImportDuplicateFile
  | typeof legacyProjectImportDuplicateFileType;

export type GenerateLegacyProjectImportPiecesErrors = typeof legacyProjectImportMissingRequiredFile;

export class LegacyProjectImport extends AggregateRoot {
  private constructor(
    readonly id: LegacyProjectImportId,
    private readonly projectId: ResourceId,
    private readonly scenarioId: ResourceId,
    private readonly ownerId: UserId,
    private isAcceptingFiles: boolean = true,
    private pieces: LegacyProjectImportComponent[] = [],
    private readonly files: LegacyProjectImportFile[] = [],
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
      snapshot.isAcceptingFiles,
      snapshot.pieces.map(LegacyProjectImportComponent.fromSnapshot),
      snapshot.files.map(LegacyProjectImportFile.fromSnapshot),
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

  private areRequiredFilesPresent(): boolean {
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
    const areRequiredFilesPresent = this.areRequiredFilesPresent();
    if (!areRequiredFilesPresent)
      return left(legacyProjectImportMissingRequiredFile);

    const piecesData: {
      kind: LegacyProjectImportPiece;
      location?: ArchiveLocation;
    }[] = [
      { kind: LegacyProjectImportPiece.PlanningGrid },
      { kind: LegacyProjectImportPiece.ScenarioPusData },
      { kind: LegacyProjectImportPiece.Features },
      { kind: LegacyProjectImportPiece.FeaturesSpecification },
    ];

    const solutionsFile = this.files.find(
      (file) => file.type === LegacyProjectImportFileType.Output,
    );
    if (solutionsFile) {
      piecesData.push({
        kind: LegacyProjectImportPiece.Solutions,
        location: solutionsFile.location,
      });
    }

    this.files
      .filter(
        (file) => file.type === LegacyProjectImportFileType.FeatureShapefile,
      )
      .forEach((featureShapefile) => {
        piecesData.push({
          kind: LegacyProjectImportPiece.FeatureShapefile,
          location: featureShapefile.location,
        });
      });

    return right(
      piecesData.map(({ kind, location }) =>
        LegacyProjectImportComponent.newOne(kind, location),
      ),
    );
  }

  start(): Either<GenerateLegacyProjectImportPiecesErrors, true> {
    this.isAcceptingFiles = false;
    const piecesOrError = this.generatePieces();

    if (isLeft(piecesOrError)) return piecesOrError;

    this.pieces = piecesOrError.right;

    this.apply(new LegacyProjectImportRequested(this.id, this.projectId));
    this.requestFirstBatch();

    return right(true);
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
      projectId: this.projectId.value,
      scenarioId: this.scenarioId.value,
      ownerId: this.ownerId.value,
      isAcceptingFiles: this.isAcceptingFiles,
      pieces: this.pieces.map((piece) => piece.toSnapshot()),
      files: this.files.map((file) => file.toSnapshot()),
    };
  }

  addFile(
    file: LegacyProjectImportFile,
  ): Either<AddFileToLegacyProjectImportErrors, true> {
    const isFeatureShapefileFile =
      file.type === LegacyProjectImportFileType.FeatureShapefile;
    const fileTypeAlreadyPresent = this.files.some(
      (el) => el.type === file.type,
    );

    if (fileTypeAlreadyPresent && !isFeatureShapefileFile) {
      return left(legacyProjectImportDuplicateFileType);
    }

    const duplicateArchiveLocation = this.files.some(
      (el) => el.location === file.location,
    );

    if (duplicateArchiveLocation) {
      return left(legacyProjectImportDuplicateFile);
    }

    this.files.push(file);

    return right(true);
  }
}
