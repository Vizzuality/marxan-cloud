import {
  ArchiveLocation,
  ClonePiece,
  ComponentLocation,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import { ClonePieceRelativePaths } from '@marxan/cloning/infrastructure/clone-piece-data';
import { ProjectExportConfigContent } from '@marxan/cloning/infrastructure/clone-piece-data/export-config';
import { Injectable } from '@nestjs/common';
import { ImportResourcePieces } from '../application/import-resource-pieces.port';
import { ImportComponent } from '../domain';

@Injectable()
export class ImportResourcePiecesAdapter implements ImportResourcePieces {
  resolveForProject(
    id: ResourceId,
    location: ArchiveLocation,
    scenarios: ProjectExportConfigContent['scenarios'],
  ): ImportComponent[] {
    const scenarioPieces = scenarios.flatMap((scenario) =>
      this.resolveForScenario(
        new ResourceId(scenario.id),
        ResourceKind.Project,
        location,
      ),
    );

    return [
      ImportComponent.newOne(id, ClonePiece.ProjectMetadata, 0, [
        new ComponentLocation(
          location.value,
          ClonePieceRelativePaths[ClonePiece.ProjectMetadata].projectMetadata,
        ),
      ]),
      ...scenarioPieces,
    ];
  }

  resolveForScenario(
    id: ResourceId,
    kind: ResourceKind,
    location: ArchiveLocation,
  ): ImportComponent[] {
    const oldScenarioId = id.value;
    const newScenarioId = ResourceId.create();
    const resourceId = kind === ResourceKind.Project ? newScenarioId : id;

    return [
      ImportComponent.newOne(resourceId, ClonePiece.ScenarioMetadata, 1, [
        new ComponentLocation(
          location.value,
          ClonePieceRelativePaths[
            ClonePiece.ScenarioMetadata
          ].getScenarioMetadataRelativePath(kind, oldScenarioId),
        ),
      ]),
    ];
  }
}
