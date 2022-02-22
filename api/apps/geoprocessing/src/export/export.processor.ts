import { ExportJobInput, ExportJobOutput } from '@marxan/cloning';
import { Injectable } from '@nestjs/common';

import { ExportPiecesProvider } from './pieces/export-pieces.provider';

@Injectable()
export class ExportProcessor {
  constructor(private readonly piecesExporters: ExportPiecesProvider) {}

  run(input: ExportJobInput): Promise<ExportJobOutput> {
    const provider = this.piecesExporters.getPieceProvider(
      input.piece,
      input.resourceKind,
    );
    if (!provider) {
      throw new Error(`${input.piece} is not yet supported.`);
    }
    return provider.run(input);
  }
}
