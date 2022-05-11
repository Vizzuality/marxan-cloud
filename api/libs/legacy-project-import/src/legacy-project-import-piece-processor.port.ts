import { LegacyProjectImportPiece } from './domain/legacy-project-import-piece';

export abstract class LegacyProjectImportPieceProcessor<I, O> {
  abstract run(input: I): Promise<O>;

  abstract isSupported(piece: LegacyProjectImportPiece): boolean;
}
