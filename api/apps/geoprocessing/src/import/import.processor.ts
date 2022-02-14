import { ImportJobInput, ImportJobOutput } from '@marxan/cloning';
import { Injectable } from '@nestjs/common';
import { ImportPiecesProvider } from './pieces/import-pieces.provider';

@Injectable()
export class ImportProcessor {
  constructor(private readonly piecesImporters: ImportPiecesProvider) {}

  run(input: ImportJobInput): Promise<ImportJobOutput> {
    const provider = this.piecesImporters.getPieceProvider(input.piece);
    if (!provider) {
      throw new Error(`${input.piece} is not yet supported.`);
    }
    return provider.run(input);
  }
}
