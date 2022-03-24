import {
  ArchiveLocation,
  ClonePiece,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import {
  clonePieceImportOrder,
  ClonePieceUrisResolver,
  exportOnlyClonePieces,
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
    projectId: ResourceId,
    location: ArchiveLocation,
    pieces: ProjectExportConfigContent['pieces'],
  ): ImportComponent[] {
    const projectComponents = pieces.project
      .filter((piece) => !exportOnlyClonePieces.includes(piece))
      .map((piece) =>
        ImportComponent.newOne(
          projectId,
          piece,
          clonePieceImportOrder[piece],
          ClonePieceUrisResolver.resolveFor(piece, location.value),
        ),
      );

    const scenarioIds = Object.keys(pieces.scenarios);
    const scenarioComponents = scenarioIds.flatMap((scenarioId) =>
      this.resolveForScenario(
        ResourceId.create(),
        location,
        pieces.scenarios[scenarioId],
        ResourceKind.Project,
        scenarioId,
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
      .filter((piece) => !exportOnlyClonePieces.includes(piece))
      .map((piece) =>
        ImportComponent.newOne(
          scenarioId,
          piece,
          clonePieceImportOrder[piece],
          ClonePieceUrisResolver.resolveFor(piece, location.value, {
            kind,
            scenarioId: oldScenarioId,
          }),
        ),
      );
  }
}
