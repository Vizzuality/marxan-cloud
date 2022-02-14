import { SetMetadata } from '@nestjs/common';
import { ClonePiece, ExportJobInput, ExportJobOutput } from '@marxan/cloning';

export const PieceProcessorProvider = Symbol(`Piece processor provider`);

export const PieceExportProvider = () =>
  SetMetadata(PieceProcessorProvider, true);

export abstract class PieceProcessor {
  abstract run(input: ExportJobInput): Promise<ExportJobOutput>;

  abstract isSupported(piece: ClonePiece): boolean;
}
