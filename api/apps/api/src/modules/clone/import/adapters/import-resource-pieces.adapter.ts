import {
  ArchiveLocation,
  ComponentLocation,
  ResourceId,
  ResourceKind,
} from '@marxan/cloning/domain';
import {
  clonePieceImportOrder,
  ClonePieceRelativePathResolver,
  exportOnlyClonePieces,
} from '@marxan/cloning/infrastructure/clone-piece-data';
import {
  ProjectExportConfigContent,
  ScenarioExportConfigContent,
} from '@marxan/cloning/infrastructure/clone-piece-data/export-config';
import { Injectable } from '@nestjs/common';
import { ExportComponentSnapshot } from '../../export/domain';
import { ImportResourcePieces } from '../application/import-resource-pieces.port';
import { ImportComponent } from '../domain';

@Injectable()
export class ImportResourcePiecesAdapter implements ImportResourcePieces {
  private getProjectPieces(
    projectId: ResourceId,
    pieces: ExportComponentSnapshot[],
  ): ExportComponentSnapshot[] {
    return pieces.filter((piece) => piece.resourceId === projectId.value);
  }

  private getScenarioPieces(
    projectId: ResourceId,
    pieces: ExportComponentSnapshot[],
  ): ExportComponentSnapshot[] {
    return pieces.filter((piece) => piece.resourceId !== projectId.value);
  }

  private getImportPieces(
    pieces: ExportComponentSnapshot[],
  ): ExportComponentSnapshot[] {
    return pieces.filter(
      (component) => !exportOnlyClonePieces.includes(component.piece),
    );
  }

  resolveForProject(
    projectId: ResourceId,
    pieces: ExportComponentSnapshot[],
    oldProjectId: ResourceId,
  ): ImportComponent[] {
    const importPieces = this.getImportPieces(pieces);

    const projectComponents = this.getProjectPieces(
      oldProjectId,
      importPieces,
    ).map((component) =>
      ImportComponent.newOne(
        projectId,
        component.piece,
        clonePieceImportOrder[component.piece],
        ComponentLocation.fromSnapshots(component.uris),
      ),
    );

    const resourceIdMapping: Record<string, ResourceId> = {};
    const scenarioPieces = this.getScenarioPieces(oldProjectId, importPieces);

    scenarioPieces.forEach((piece) => {
      if (!resourceIdMapping[piece.resourceId])
        resourceIdMapping[piece.resourceId] = ResourceId.create();
    });

    const scenarioComponents = Object.keys(resourceIdMapping).flatMap(
      (oldScenarioId) =>
        this.resolveForScenario(
          resourceIdMapping[oldScenarioId],
          scenarioPieces.filter((piece) => piece.resourceId === oldScenarioId),
        ),
    );

    return [...projectComponents, ...scenarioComponents];
  }

  resolveForScenario(
    scenarioId: ResourceId,
    pieces: ExportComponentSnapshot[],
  ): ImportComponent[] {
    const importPieces = this.getImportPieces(pieces);

    return importPieces.map((component) =>
      ImportComponent.newOne(
        scenarioId,
        component.piece,
        clonePieceImportOrder[component.piece],
        ComponentLocation.fromSnapshots(component.uris),
      ),
    );
  }
}
