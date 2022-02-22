import {
  ArchiveLocation,
  ClonePiece,
  ComponentLocation,
  ResourceId,
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
      this.resolveForScenarioWithinProjectImport(
        ResourceId.create(),
        scenario.id,
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

  private resolveForScenarioWithinProjectImport(
    scenarioId: ResourceId,
    oldScenarioId: string,
    location: ArchiveLocation,
  ): ImportComponent[] {
    return [
      ImportComponent.newOne(scenarioId, ClonePiece.ScenarioMetadata, 1, [
        new ComponentLocation(
          location.value,
          ClonePieceRelativePaths[ClonePiece.ScenarioMetadata].projectImport(
            oldScenarioId,
          ),
        ),
      ]),
    ];
  }

  resolveForScenario(
    scenarioId: ResourceId,
    location: ArchiveLocation,
  ): ImportComponent[] {
    return [
      ImportComponent.newOne(scenarioId, ClonePiece.ScenarioMetadata, 1, [
        new ComponentLocation(
          location.value,
          ClonePieceRelativePaths[ClonePiece.ScenarioMetadata].scenarioImport,
        ),
      ]),
    ];
  }
}
