import { ComponentLocation, ResourceKind } from '../../domain';
import { ClonePiece } from '../../domain/clone-piece';
import { exportConfigRelativePath } from './export-config';
import { featuresSpecificationRelativePath } from './features-specification';
import { planningAreaGridGeoJSONRelativePath } from './planning-are-grid-geojson';
import { planningAreaCustomRelativePath } from './planning-area-custom';
import { planningAreaCustomGeoJSONRelativePath } from './planning-area-custom-geojson';
import { planningAreaGadmRelativePath } from './planning-area-gadm';
import { planningAreaCustomGridRelativePath } from './planning-area-grid';
import { projectCustomProtectedAreasRelativePath } from './project-custom-protected-areas';
import { projectMetadataRelativePath } from './project-metadata';
import { scenarioMetadataRelativePath } from './scenario-metadata';
import { scenarioProtectedAreasRelativePath } from './scenario-protected-areas';
import { scenarioPuDataRelativePath } from './scenario-pu-data';
import { scenarioRunResultsRelativePath } from './scenario-run-results';
import { userUploadedFeaturesRelativePath } from './user-uploaded-features';

export const ClonePieceImportOrder: Record<ClonePiece, number> = {
  // Export config pieces should never be imported. When a import
  // request arrives, export config piece is "processed" in ExportConfigReader
  // we keep ClonePiece.ExportConfig key for typing reasons
  [ClonePiece.ExportConfig]: -1,
  [ClonePiece.ProjectMetadata]: 0,
  [ClonePiece.ScenarioMetadata]: 1,
  [ClonePiece.PlanningAreaGAdm]: 1,
  [ClonePiece.PlanningAreaCustom]: 1,
  [ClonePiece.PlanningAreaGrid]: 2,
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
    [ClonePiece.PlanningAreaCustomGeojson]: (location) => [
      new ComponentLocation(location, planningAreaCustomGeoJSONRelativePath),
    ],
    [ClonePiece.PlanningAreaGrid]: (location) => [
      new ComponentLocation(location, planningAreaCustomGridRelativePath),
    ],
    [ClonePiece.PlanningAreaGridGeojson]: (location) => [
      new ComponentLocation(location, planningAreaGridGeoJSONRelativePath),
    ],
    [ClonePiece.ProjectMetadata]: (location) => [
      new ComponentLocation(location, projectMetadataRelativePath),
    ],
    [ClonePiece.ProjectCustomProtectedAreas]: (location) => [
      new ComponentLocation(location, projectCustomProtectedAreasRelativePath),
    ],
    [ClonePiece.UserUploadedFeatures]: (location) => [
      new ComponentLocation(location, userUploadedFeaturesRelativePath),
    ],
    [ClonePiece.FeaturesSpecification]: (location) => [
      new ComponentLocation(location, featuresSpecificationRelativePath),
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
    [ClonePiece.ScenarioPuData]: (location, extraData) => {
      if (!extraData)
        throw new Error(
          'It is not possible generate scenario pieces uris without export kind or old scenario id',
        );

      return [
        new ComponentLocation(
          location,
          extraData.kind === ResourceKind.Project
            ? scenarioPuDataRelativePath.projectImport(extraData.scenarioId)
            : scenarioPuDataRelativePath.scenarioImport,
        ),
      ];
    },
    [ClonePiece.ScenarioProtectedAreas]: (location, extraData) => {
      if (!extraData)
        throw new Error(
          'It is not possible generate scenario pieces uris without export kind or old scenario id',
        );

      return [
        new ComponentLocation(
          location,
          extraData.kind === ResourceKind.Project
            ? scenarioProtectedAreasRelativePath.projectImport(
                extraData.scenarioId,
              )
            : scenarioProtectedAreasRelativePath.scenarioImport,
        ),
      ];
    },
    [ClonePiece.ScenarioRunResults]: (location, extraData) => {
      if (!extraData)
        throw new Error(
          'It is not possible generate scenario pieces uris without export kind or old scenario id',
        );

      return [
        new ComponentLocation(
          location,
          extraData.kind === ResourceKind.Project
            ? scenarioRunResultsRelativePath.projectImport(extraData.scenarioId)
            : scenarioRunResultsRelativePath.scenarioImport,
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
