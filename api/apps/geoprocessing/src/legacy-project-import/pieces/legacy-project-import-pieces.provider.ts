import { LegacyProjectImportPiece } from '@marxan/legacy-project-import';
import { Injectable } from '@nestjs/common';
import { LegacyProjectImportPieceProcessor } from './legacy-project-import-piece-processor';

@Injectable()
export class LegacyProjectImportPiecesProvider {
  private readonly providers: LegacyProjectImportPieceProcessor[] = [];

  registerProvider(provider: LegacyProjectImportPieceProcessor): void {
    this.providers.push(provider);
  }

  getPieceProvider(
    piece: LegacyProjectImportPiece,
  ): LegacyProjectImportPieceProcessor | undefined {
    for (const provider of this.providers) {
      if (provider.isSupported(piece)) {
        return provider;
      }
    }
  }
}
