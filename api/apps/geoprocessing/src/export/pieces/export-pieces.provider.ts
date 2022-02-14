import { Injectable } from '@nestjs/common';
import { ClonePiece } from '@marxan/cloning';
import { ExportPieceProcessor } from './export-piece-processor';

@Injectable()
export class ExportPiecesProvider {
  private readonly providers: ExportPieceProcessor[] = [];

  registerProvider(provider: ExportPieceProcessor): void {
    this.providers.push(provider);
  }

  getPieceProvider(piece: ClonePiece): ExportPieceProcessor | undefined {
    for (const provider of this.providers) {
      if (provider.isSupported(piece)) {
        return provider;
      }
    }
  }
}
