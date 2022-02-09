import { ClonePiece, ResourceId, ResourceKind } from '@marxan/cloning/domain';
import { Injectable } from '@nestjs/common';
import { ResourcePieces } from '../../application/resource-pieces.port';
import { ExportComponent } from '../../domain';
import { ResourcePiecesProvider } from '../resource-pieces.adapter';

@Injectable()
@ResourcePiecesProvider(ResourceKind.Scenario)
export class ScenarioResourcePiecesAdapter implements ResourcePieces {
  async resolveFor(
    id: ResourceId,
    kind: ResourceKind,
  ): Promise<ExportComponent[]> {
    const pieces: ExportComponent[] = [
      ExportComponent.newOne(id, ClonePiece.ScenarioMetadata),
    ];

    if (kind === ResourceKind.Scenario) {
      pieces.push(ExportComponent.newOne(id, ClonePiece.ExportConfig));
    }

    return pieces;
  }
}
