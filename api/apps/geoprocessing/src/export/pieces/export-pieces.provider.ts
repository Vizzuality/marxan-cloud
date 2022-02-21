import { Injectable } from '@nestjs/common';
import { ClonePiece } from '@marxan/cloning';
import { ResourceKind } from '@marxan/cloning/domain';
import { ExportPieceProcessor } from './export-piece-processor';

@Injectable()
export class ExportPiecesProvider {
  private readonly providers: ExportPieceProcessor[] = [];

  registerProvider(provider: ExportPieceProcessor): void {
    this.providers.push(provider);
  }

  getPieceProvider(
    piece: ClonePiece,
    kind: ResourceKind,
  ): ExportPieceProcessor | undefined {
    for (const provider of this.providers) {
      if (provider.isSupported(piece, kind)) {
        return provider;
      }
    }
  }
}
