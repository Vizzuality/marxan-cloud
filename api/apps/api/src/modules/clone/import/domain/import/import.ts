import { AggregateRoot } from '@nestjs/cqrs';
import { ImportSnapshot } from './import.snapshot';
import { ImportComponentSnapshot } from './import.component.snapshot';
import { Either, left, right } from 'fp-ts/Either';
import { v4 } from 'uuid';
import {
  ResourceKind,
  ArchiveLocation,
  ResourceId,
} from '@marxan/cloning/domain';
import {
  AllPiecesImported,
  ImportRequested,
  PieceImported,
  PieceImportRequested,
} from '../events';

type ImportComponent = ImportComponentSnapshot;

export const componentNotFound = Symbol(`component not found`);
export const componentAlreadyCompleted = Symbol(`component already completed`);

export type CompletePieceSuccess = true;
export type CompletePieceErrors =
  | typeof componentNotFound
  | typeof componentAlreadyCompleted;

export class Import extends AggregateRoot {
  private constructor(
    private readonly id: string,
    private readonly resourceId: ResourceId,
    private readonly resourceKind: ResourceKind,
    private readonly archiveLocation: ArchiveLocation,
    private readonly pieces: ImportComponent[],
  ) {
    super();
  }

  static from(snapshot: ImportSnapshot): Import {
    return new Import(
      snapshot.id,
      snapshot.resourceId,
      snapshot.resourceKind,
      snapshot.archiveLocation,
      snapshot.importPieces.sort(this.orderSorter),
    );
  }

  static new(data: Omit<ImportSnapshot, 'id'>): Import {
    const id = v4();
    const instance = new Import(
      id,
      data.resourceId,
      data.resourceKind,
      data.archiveLocation,
      data.importPieces.sort(this.orderSorter),
    );
    instance.apply(new ImportRequested(id, data.resourceId, data.resourceKind));
    instance.requestFirstBatch();
    return instance;
  }

  completePiece(
    piece: ImportComponentSnapshot &
      Required<Pick<ImportComponentSnapshot, 'uri'>>,
  ): Either<CompletePieceErrors, CompletePieceSuccess> {
    const pieceToComplete = this.pieces.find(
      (pc) => pc.id.value === piece.id.value,
    );
    if (!pieceToComplete) {
      return left(componentNotFound);
    }

    if (pieceToComplete.uri) {
      return left(componentAlreadyCompleted);
    }

    pieceToComplete.uri = piece.uri;

    this.apply(
      new PieceImported(
        pieceToComplete.id,
        pieceToComplete.piece,
        pieceToComplete.resourceId,
        pieceToComplete.uri,
      ),
    );

    const nextBatch = this.getNextComponents(pieceToComplete);

    if (nextBatch.finished) {
      this.apply(new AllPiecesImported());
    } else {
      for (const nextPiece of nextBatch.components) {
        this.apply(
          new PieceImportRequested(
            pieceToComplete.id,
            pieceToComplete.piece,
            pieceToComplete.resourceId,
          ),
        );
      }
    }

    return right(true);
  }

  toSnapshot(): ImportSnapshot {
    return {
      id: this.id,
      resourceId: this.resourceId,
      resourceKind: this.resourceKind,
      importPieces: this.pieces,
      archiveLocation: this.archiveLocation,
    };
  }

  private requestFirstBatch() {
    if (this.pieces.length === 0) {
      this.apply(new AllPiecesImported());
    } else {
      // we kindly assume that first batch is not done already
      for (const component of this.pieces.filter(
        (pc) => pc.order === this.pieces[0].order,
      )) {
        this.apply(
          new PieceImportRequested(
            component.id,
            component.piece,
            component.resourceId,
          ),
        );
      }
    }
  }

  private getNextComponents(
    lastPiece: ImportComponent,
  ): { components: ImportComponent[]; finished: boolean } {
    const elements = this.pieces.filter((pc) => pc.order === lastPiece.order);
    const hasIncompletePiecesForBatch = elements.some((pc) => !Boolean(pc.uri));

    if (hasIncompletePiecesForBatch) {
      return {
        components: [],
        finished: false,
      };
    }

    const location = this.pieces.indexOf(lastPiece);
    const nextComponentLocation = location + 1;
    const nextComponent = this.pieces[nextComponentLocation];

    if (nextComponent) {
      return {
        components: this.pieces.filter(
          (pc) => pc.order === nextComponent.order,
        ),
        finished: false,
      };
    }

    return {
      components: [],
      finished: true,
    };
  }

  private static orderSorter = (a: { order: number }, b: { order: number }) =>
    a.order - b.order;
}
