import {
  ArchiveLocation,
  ClonePiece,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import {
  ClonePieceImportOrder,
  ClonePieceUris,
} from '@marxan/cloning/infrastructure/clone-piece-data';
import {
  ProjectExportConfigContent,
  ScenarioExportConfigContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/export-config';
import { Injectable } from '@nestjs/common';
import { ImportResourcePieces } from '../application/import-resource-pieces.port';
import { ImportComponent } from '../domain';

@Injectable()
export class ImportResourcePiecesAdapter implements ImportResourcePieces {
  resolveForProject(
    id: ResourceId,
    location: ArchiveLocation,
    pieces: ProjectExportConfigContent['pieces'],
  ): ImportComponent[] {
    const projectComponents = pieces.project
      .filter((piece) => piece !== ClonePiece.ExportConfig)
      .map((piece) =>
        ImportComponent.newOne(
          id,
          piece,
          ClonePieceImportOrder[piece],
          ClonePieceUris[piece](location.value),
        ),
      );

    const scenarios = Object.keys(pieces.scenarios);
    const scenarioComponents = scenarios.flatMap((id) =>
      this.resolveForScenario(
        ResourceId.create(),
        location,
        pieces.scenarios[id],
        ResourceKind.Project,
        id,
      ),
    );

    return [...projectComponents, ...scenarioComponents];
  }

  resolveForScenario(
    scenarioId: ResourceId,
    location: ArchiveLocation,
    pieces: ScenarioExportConfigContent['pieces'],
    kind: ResourceKind,
    oldScenarioId: string,
  ): ImportComponent[] {
    return pieces
      .filter((piece) => piece !== ClonePiece.ExportConfig)
      .map((piece) =>
        ImportComponent.newOne(
          scenarioId,
          piece,
          ClonePieceImportOrder[piece],
          ClonePieceUris[piece](location.value, {
            kind,
            scenarioId: oldScenarioId,
          }),
        ),
      );
  }
}
