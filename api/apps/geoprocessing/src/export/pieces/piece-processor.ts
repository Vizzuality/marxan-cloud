import { SetMetadata } from '@nestjs/common';
import { ClonePiece, JobInput, JobOutput } from '@marxan/cloning';

export const PieceProcessorProvider = Symbol(`Piece processor provider`);

export const PieceExportProvider = () =>
  SetMetadata(PieceProcessorProvider, true);

export abstract class PieceProcessor {
  abstract run(input: JobInput): Promise<JobOutput>;

  abstract isSupported(piece: ClonePiece): boolean;
}
