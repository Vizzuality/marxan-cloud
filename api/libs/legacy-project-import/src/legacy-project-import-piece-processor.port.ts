import { LegacyProjectImportPiece } from './domain/legacy-project-import-piece';

export abstract class LegacyProjectImportPieceProcessor<I, O> {
  abstract run(input: I, retries?: number): Promise<O>;

  abstract isSupported(piece: LegacyProjectImportPiece): boolean;
}
