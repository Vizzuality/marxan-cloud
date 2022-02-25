import { ComponentLocation, ResourceKind } from '../../domain';
import { ClonePiece } from '../../domain/clone-piece';
import { exportConfigRelativePath } from './export-config';
import { planningAreaCustomRelativePath } from './planning-area-custom';
import { planningAreaGadmRelativePath } from './planning-area-gadm';
import { planningAreaCustomGridRelativePath } from './planning-area-grid-custom';
import { projectMetadataRelativePath } from './project-metadata';
import { scenarioMetadataRelativePath } from './scenario-metadata';

export const ClonePieceImportOrder: Record<ClonePiece, number> = {
  // Export config pieces should never be imported. When a import
  // request arrives, export config piece is "processed" in ExportConfigReader
  // we keep ClonePiece.ExportConfig key for typing reasons
  [ClonePiece.ExportConfig]: -1,
  [ClonePiece.ProjectMetadata]: 0,
  [ClonePiece.ScenarioMetadata]: 1,
  [ClonePiece.PlanningAreaGAdm]: 1,
  [ClonePiece.PlanningAreaCustom]: 1,
  [ClonePiece.PlanningAreaGridCustom]: 2,
};

export class ClonePieceUrisResolver {
  private static clonePieceUris: Record<
    ClonePiece,
    (
      location: string,
      scenarioPiecesExtraData?: { kind: ResourceKind; scenarioId: string },
    ) => ComponentLocation[]
  > = {
    [ClonePiece.ExportConfig]: (location) => [
      new ComponentLocation(location, exportConfigRelativePath),
    ],
    [ClonePiece.PlanningAreaGAdm]: (location) => [
      new ComponentLocation(location, planningAreaGadmRelativePath),
    ],
    [ClonePiece.PlanningAreaCustom]: (location) => [
      new ComponentLocation(location, planningAreaCustomRelativePath),
    ],
    [ClonePiece.PlanningAreaGridCustom]: (location) => [
      new ComponentLocation(location, planningAreaCustomGridRelativePath),
    ],
    [ClonePiece.ProjectMetadata]: (location) => [
      new ComponentLocation(location, projectMetadataRelativePath),
    ],
    [ClonePiece.ScenarioMetadata]: (location, extraData) => {
      if (!extraData)
        throw new Error(
          'It is not possible generate scenario pieces uris without export kind or old scenario id',
        );

      return [
        new ComponentLocation(
          location,
          extraData.kind === ResourceKind.Project
            ? scenarioMetadataRelativePath.projectImport(extraData.scenarioId)
            : scenarioMetadataRelativePath.scenarioImport,
        ),
      ];
    },
  };

  static resolveFor(
    clonePiece: ClonePiece,
    location: string,
    extraData?: { kind: ResourceKind; scenarioId: string },
  ): ComponentLocation[] {
    return this.clonePieceUris[clonePiece](location, extraData);
  }
}
