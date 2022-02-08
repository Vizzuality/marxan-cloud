import { ClonePiece, ResourceId, ResourceKind } from '@marxan/cloning/domain';
import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { ResourcePieces } from '../../application/resource-pieces.port';
import { ExportComponentSnapshot } from '../../domain';
import { ResourcePiecesProvider } from '../resource-pieces.adapter';

@Injectable()
@ResourcePiecesProvider(ResourceKind.Scenario)
export class ScenarioResourcePiecesAdapter implements ResourcePieces {
  async resolveFor(
    id: ResourceId,
    kind: ResourceKind,
  ): Promise<ExportComponentSnapshot[]> {
    const pieces: ExportComponentSnapshot[] = [
      {
        id: v4(),
        resourceId: id.value,
        piece: ClonePiece.ScenarioMetadata,
        finished: false,
        uris: [],
      },
    ];

    if (kind === ResourceKind.Scenario) {
      pieces.push({
        id: v4(),
        resourceId: id.value,
        piece: ClonePiece.ExportConfig,
        finished: false,
        uris: [],
      });
    }

    return pieces;
  }
}
