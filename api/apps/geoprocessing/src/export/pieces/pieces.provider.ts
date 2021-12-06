import { Injectable } from '@nestjs/common';
import { ClonePiece } from '@marxan/cloning';
import { PieceProcessor } from './piece-processor';

@Injectable()
export class PiecesProvider {
  private readonly providers: PieceProcessor[] = [];

  registerProvider(provider: PieceProcessor): void {
    this.providers.push(provider);
  }

  getPieceProvider(piece: ClonePiece): PieceProcessor | undefined {
    for (const provider of this.providers) {
      if (provider.isSupported(piece)) {
        return provider;
      }
    }
  }
}
