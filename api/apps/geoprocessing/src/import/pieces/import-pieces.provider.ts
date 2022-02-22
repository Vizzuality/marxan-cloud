import { Injectable } from '@nestjs/common';
import { ClonePiece } from '@marxan/cloning';
import { ImportPieceProcessor } from './import-piece-processor';

@Injectable()
export class ImportPiecesProvider {
  private readonly providers: ImportPieceProcessor[] = [];

  registerProvider(provider: ImportPieceProcessor): void {
    this.providers.push(provider);
  }

  getPieceProvider(piece: ClonePiece): ImportPieceProcessor | undefined {
    for (const provider of this.providers) {
      if (provider.isSupported(piece)) {
        return provider;
      }
    }
  }
}
