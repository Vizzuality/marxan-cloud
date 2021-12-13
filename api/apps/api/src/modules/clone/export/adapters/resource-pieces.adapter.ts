import { v4 } from 'uuid';
import {
  ClonePiece,
  ComponentId,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { Injectable } from '@nestjs/common';

import { ExportComponentSnapshot } from '../domain';
import { ResourcePieces } from '../application/resource-pieces.port';

@Injectable()
export class ResourcePiecesAdapter implements ResourcePieces {
  /**
   * most likely should be a kind of facade with strategy pattern
   *
   * so that we can separate resolvers for Project/Scenarios
   */
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
      },
    ];
  }
}
