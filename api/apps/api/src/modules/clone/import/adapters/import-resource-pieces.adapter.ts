import {
  ArchiveLocation,
  ClonePiece,
  ComponentLocation,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { Injectable } from '@nestjs/common';
import { ClonePieceRelativePaths } from '@marxan/cloning/infrastructure/clone-piece-data';
import { ImportResourcePieces } from '../application/import-resource-pieces.port';
import { ImportComponent } from '../domain';

@Injectable()
export class ImportResourcePiecesAdapter implements ImportResourcePieces {
  private resolverMapping: Record<
    ResourceKind,
    (
      id: ResourceId,
      kind: ResourceKind,
      location: ArchiveLocation,
    ) => Promise<ImportComponent[]>
  > = {
    project: this.resolveForProject.bind(this),
    scenario: this.resolveForScenario.bind(this),
  };

  resolveFor(
    id: ResourceId,
    kind: ResourceKind,
    location: ArchiveLocation,
  ): Promise<ImportComponent[]> {
    return this.resolverMapping[kind](id, kind, location);
  }

  private async resolveForProject(
    id: ResourceId,
    kind: ResourceKind,
    location: ArchiveLocation,
  ): Promise<ImportComponent[]> {
    return [
      ImportComponent.newOne(id, ClonePiece.ProjectMetadata, 0, [
        new ComponentLocation(
          location.value,
          ClonePieceRelativePaths[ClonePiece.ProjectMetadata].projectMetadata,
        ),
      ]),
    ];
  }

  private async resolveForScenario(
    id: ResourceId,
    kind: ResourceKind,
    location: ArchiveLocation,
  ): Promise<ImportComponent[]> {
    return [];
  }
}
