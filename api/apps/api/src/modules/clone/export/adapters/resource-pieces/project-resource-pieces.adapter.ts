import {
  ClonePiece,
  ComponentId,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { ResourcePieces } from '../../application/resource-pieces.port';
import { ExportComponentSnapshot } from '../../domain';
import { ResourcePiecesProvider } from '../resource-pieces.adapter';

@Injectable()
@ResourcePiecesProvider(ResourceKind.Project)
export class ProjectResourcePiecesAdapter implements ResourcePieces {
  async resolveFor(
    id: ResourceId,
    kind: ResourceKind,
  ): Promise<ExportComponentSnapshot[]> {
    return [
      {
        id: new ComponentId(v4()),
        resourceId: id.value,
        piece: ClonePiece.ProjectMetadata,
        finished: false,
        uris: [],
      },
      {
        id: new ComponentId(v4()),
        resourceId: id.value,
        piece: ClonePiece.ExportConfig,
        finished: false,
        uris: [],
      },
      {
        id: new ComponentId(v4()),
        resourceId: id.value,
        piece: ClonePiece.PlanningAreaCustom,
        finished: false,
        uris: [],
      },
      {
        id: new ComponentId(v4()),
        resourceId: id.value,
        piece: ClonePiece.PlanningAreaGAdm,
        finished: false,
        uris: [],
      },
      {
        id: new ComponentId(v4()),
        resourceId: id.value,
        piece: ClonePiece.PlanningAreaGridCustom,
        finished: false,
        uris: [],
      },
    ];
  }
}
