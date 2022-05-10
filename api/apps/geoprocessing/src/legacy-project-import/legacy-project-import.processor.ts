import { Injectable } from '@nestjs/common';
import {
  LegacyProjectImportJobInput,
  LegacyProjectImportJobOutput,
} from '@marxan/legacy-project-import';
import { LegacyProjectImportPiecesProvider } from './pieces/legacy-project-import-pieces.provider';

@Injectable()
export class LegacyProjectImportProcessor {
  constructor(
    private readonly piecesImporters: LegacyProjectImportPiecesProvider,
  ) {}

  run(
    input: LegacyProjectImportJobInput,
  ): Promise<LegacyProjectImportJobOutput> {
    const provider = this.piecesImporters.getPieceProvider(input.piece);
    if (!provider) {
      throw new Error(`${input.piece} is not yet supported.`);
    }
    return provider.run(input);
  }
}
