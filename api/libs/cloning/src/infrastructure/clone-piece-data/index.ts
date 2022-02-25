import { ComponentLocation, ResourceKind } from '../../domain';
import { ClonePiece } from '../../domain/clone-piece';
import { ExportConfigRelativePath } from './export-config';
import { PlanningAreaCustomRelativePath } from './planning-area-custom';
import { PlanningAreaGadmRelativePath } from './planning-area-gadm';
import { PlanningAreaCustomGridRelativePath } from './planning-area-grid-custom';
import { ProjectMetadataRelativePath } from './project-metadata';
import { ScenarioMetadataRelativePath } from './scenario-metadata';

export const ClonePieceImportOrder: Record<ClonePiece, number> = {
  [ClonePiece.ExportConfig]: -1,
  [ClonePiece.ProjectMetadata]: 0,
  [ClonePiece.ScenarioMetadata]: 1,
  [ClonePiece.PlanningAreaGAdm]: 1,
  [ClonePiece.PlanningAreaCustom]: 1,
  [ClonePiece.PlanningAreaGridCustom]: 2,
};

export const ClonePieceUris: Record<
  ClonePiece,
  (
    location: string,
    scenarioPiecesExtraData?: { kind: ResourceKind; scenarioId: string },
  ) => ComponentLocation[]
> = {
  [ClonePiece.ExportConfig]: (location) => [
    new ComponentLocation(location, ExportConfigRelativePath),
  ],
  [ClonePiece.PlanningAreaGAdm]: (location) => [
    new ComponentLocation(location, PlanningAreaGadmRelativePath),
  ],
  [ClonePiece.PlanningAreaCustom]: (location) => [
    new ComponentLocation(location, PlanningAreaCustomRelativePath),
  ],
  [ClonePiece.PlanningAreaGridCustom]: (location) => [
    new ComponentLocation(location, PlanningAreaCustomGridRelativePath),
  ],
  [ClonePiece.ProjectMetadata]: (location) => [
    new ComponentLocation(location, ProjectMetadataRelativePath),
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
          ? ScenarioMetadataRelativePath.projectImport(extraData.scenarioId)
          : ScenarioMetadataRelativePath.scenarioImport,
      ),
    ];
  },
};
