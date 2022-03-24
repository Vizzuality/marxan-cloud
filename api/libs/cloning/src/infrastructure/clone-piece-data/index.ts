import { ComponentLocation, ResourceKind } from '../../domain';
import { ClonePiece } from '../../domain/clone-piece';
import { exportConfigRelativePath } from './export-config';
import { featuresSpecificationRelativePath } from './features-specification';
import { planningUnitsGridGeoJSONRelativePath } from './planning-units-grid-geojson';
import { planningAreaCustomRelativePath } from './planning-area-custom';
import { planningAreaCustomGeoJSONRelativePath } from './planning-area-custom-geojson';
import { planningAreaGadmRelativePath } from './planning-area-gadm';
import { planningUnitsGridRelativePath } from './planning-units-grid';
import { projectCustomProtectedAreasRelativePath } from './project-custom-protected-areas';
import { projectMetadataRelativePath } from './project-metadata';
import { scenarioMetadataRelativePath } from './scenario-metadata';
import { scenarioProtectedAreasRelativePath } from './scenario-protected-areas';
import { scenarioPlanningUnitsDataRelativePath } from './scenario-planning-units-data';
import { scenarioRunResultsRelativePath } from './scenario-run-results';
import { userUploadedFeaturesRelativePath } from './user-uploaded-features';

export const exportOnlyClonePieces: ClonePiece[] = [
  ClonePiece.ExportConfig,
  ClonePiece.PlanningUnitsGridGeojson,
  ClonePiece.PlanningAreaCustomGeojson,
];

export const clonePieceImportOrder: Record<ClonePiece, number> = {
  // ExportConfig pieces should never be imported. When a import
  // request arrives, export config piece is "processed" in ExportConfigReader
  // we keep ClonePiece.ExportConfig key for typing reasons
  //
  // PlanningAreaGridGeojson and PlanningAreaCustomGeojson should never be imported
  [ClonePiece.ExportConfig]: -1,
  [ClonePiece.PlanningUnitsGridGeojson]: -1,
  [ClonePiece.PlanningAreaCustomGeojson]: -1,
  //
  [ClonePiece.ProjectMetadata]: 0,
  //
  [ClonePiece.ScenarioMetadata]: 1,
  [ClonePiece.PlanningAreaGAdm]: 1,
  [ClonePiece.PlanningAreaCustom]: 1,
  [ClonePiece.PlanningUnitsGrid]: 1,
  [ClonePiece.ProjectCustomProtectedAreas]: 1,
  //
  [ClonePiece.ScenarioProtectedAreas]: 2,
  [ClonePiece.ScenarioPlanningUnitsData]: 2,
  //
  [ClonePiece.ScenarioRunResults]: 3,
  // Temporal import order
  [ClonePiece.UserUploadedFeatures]: 4,
  [ClonePiece.FeaturesSpecification]: 4,
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
    [ClonePiece.PlanningUnitsGrid]: (location) => [
      new ComponentLocation(location, planningUnitsGridRelativePath),
    ],
    [ClonePiece.PlanningUnitsGridGeojson]: (location) => [
      new ComponentLocation(location, planningUnitsGridGeoJSONRelativePath),
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
    [ClonePiece.ScenarioPlanningUnitsData]: (location, extraData) => {
      if (!extraData)
        throw new Error(
          'It is not possible generate scenario pieces uris without export kind or old scenario id',
        );

      return [
        new ComponentLocation(
          location,
          extraData.kind === ResourceKind.Project
            ? scenarioPlanningUnitsDataRelativePath.projectImport(
                extraData.scenarioId,
              )
            : scenarioPlanningUnitsDataRelativePath.scenarioImport,
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
