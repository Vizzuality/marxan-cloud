import { LegacyProjectImportPiece } from './domain';

export abstract class LegacyProjectImportPieceProcessor<I, O> {
  abstract run(input: I): Promise<O>;

  abstract isSupported(piece: LegacyProjectImportPiece): boolean;
}
