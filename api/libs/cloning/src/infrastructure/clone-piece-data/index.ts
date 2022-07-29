import { isDefined } from '../../../../utils/src';
import { SlugService } from '../../../../utils/src/slug.service';
import { ComponentLocation, ResourceKind } from '../../domain';
import { ClonePiece } from '../../domain/clone-piece';
import { exportConfigRelativePath } from './export-config';
import { marxanExecutionMetadataRelativePath } from './marxan-execution-metadata';
import { planningAreaCustomRelativePath } from './planning-area-custom';
import { planningAreaCustomGeoJSONRelativePath } from './planning-area-custom-geojson';
import { planningAreaGadmRelativePath } from './planning-area-gadm';
import { planningUnitsGridRelativePath } from './planning-units-grid';
import { planningUnitsGridGeoJSONRelativePath } from './planning-units-grid-geojson';
import { projectCustomFeaturesRelativePath } from './project-custom-features';
import { projectCustomProtectedAreasRelativePath } from './project-custom-protected-areas';
import { projectMetadataRelativePath } from './project-metadata';
import { projectPuvsprCalculationsRelativePath } from './project-puvspr-calculations';
import { scenarioFeaturesDataRelativePath } from './scenario-features-data';
import { featuresSpecificationRelativePath } from './scenario-features-specification';
import { scenarioInputFolderRelativePath } from './scenario-input-folder';
import { scenarioMetadataRelativePath } from './scenario-metadata';
import { scenarioOutputFolderRelativePath } from './scenario-output-folder';
import { scenarioPlanningUnitsDataRelativePath } from './scenario-planning-units-data';
import { scenarioProtectedAreasRelativePath } from './scenario-protected-areas';
import { scenarioRunResultsRelativePath } from './scenario-run-results';

export const exportOnlyClonePieces: ClonePiece[] = [
  ClonePiece.ExportConfig,
  ClonePiece.PlanningUnitsGridGeojson,
  ClonePiece.PlanningAreaCustomGeojson,
  ClonePiece.ScenarioInputFolder,
  ClonePiece.ScenarioOutputFolder,
];

type RelativePathResolverExtraData = {
  kind: ResourceKind;
  scenarioId: string;
  scenarioName?: string;
};

type RelativePathResolver = (
  extraData?: RelativePathResolverExtraData,
) => string;

export const clonePieceImportOrder: Record<ClonePiece, number> = {
  // ExportConfig pieces should never be imported. When a import
  // request arrives, export config piece is "processed" in ExportConfigReader
  // we keep ClonePiece.ExportConfig key for typing reasons
  //
  // PlanningAreaGridGeojson and PlanningAreaCustomGeojson should never be imported
  // ScenarioInputFolder and ScenarioOutputFolder should never be imported
  [ClonePiece.ExportConfig]: -1,
  [ClonePiece.PlanningUnitsGridGeojson]: -1,
  [ClonePiece.PlanningAreaCustomGeojson]: -1,
  [ClonePiece.ScenarioInputFolder]: -1,
  [ClonePiece.ScenarioOutputFolder]: -1,
  //
  [ClonePiece.ProjectMetadata]: 0,
  //
  [ClonePiece.ScenarioMetadata]: 1,
  [ClonePiece.PlanningAreaGAdm]: 1,
  [ClonePiece.PlanningAreaCustom]: 1,
  [ClonePiece.PlanningUnitsGrid]: 1,
  [ClonePiece.ProjectCustomProtectedAreas]: 1,
  //
  [ClonePiece.ProjectCustomFeatures]: 2,
  //
  [ClonePiece.ProjectPuvsprCalculations]: 3,
  [ClonePiece.ScenarioProtectedAreas]: 3,
  [ClonePiece.ScenarioPlanningUnitsData]: 3,
  [ClonePiece.ScenarioFeaturesData]: 3,
  //
  [ClonePiece.ScenarioRunResults]: 4,
  [ClonePiece.MarxanExecutionMetadata]: 4,
  [ClonePiece.FeaturesSpecification]: 4,
};

export class ClonePieceRelativePathResolver {
  private static clonePieceRelativePaths: Record<
    ClonePiece,
    RelativePathResolver
  > = {
    [ClonePiece.ExportConfig]: () => exportConfigRelativePath,
    [ClonePiece.PlanningAreaGAdm]: () => planningAreaGadmRelativePath,
    [ClonePiece.PlanningAreaCustom]: () => planningAreaCustomRelativePath,
    [ClonePiece.PlanningAreaCustomGeojson]: ClonePieceRelativePathResolver.marxanDataProjectPieceRelativePathResolver(
      planningAreaCustomGeoJSONRelativePath,
    ),
    [ClonePiece.PlanningUnitsGrid]: () => planningUnitsGridRelativePath,
    [ClonePiece.PlanningUnitsGridGeojson]: ClonePieceRelativePathResolver.marxanDataProjectPieceRelativePathResolver(
      planningUnitsGridGeoJSONRelativePath,
    ),
    [ClonePiece.ProjectMetadata]: () => projectMetadataRelativePath,
    [ClonePiece.ProjectCustomProtectedAreas]: () =>
      projectCustomProtectedAreasRelativePath,
    [ClonePiece.ProjectCustomFeatures]: () => projectCustomFeaturesRelativePath,
    [ClonePiece.ProjectPuvsprCalculations]: () =>
      projectPuvsprCalculationsRelativePath,
    [ClonePiece.FeaturesSpecification]: ClonePieceRelativePathResolver.scenarioPieceRelativePathResolver(
      featuresSpecificationRelativePath,
    ),
    [ClonePiece.ScenarioMetadata]: ClonePieceRelativePathResolver.scenarioPieceRelativePathResolver(
      scenarioMetadataRelativePath,
    ),
    [ClonePiece.ScenarioPlanningUnitsData]: ClonePieceRelativePathResolver.scenarioPieceRelativePathResolver(
      scenarioPlanningUnitsDataRelativePath,
    ),
    [ClonePiece.ScenarioProtectedAreas]: ClonePieceRelativePathResolver.scenarioPieceRelativePathResolver(
      scenarioProtectedAreasRelativePath,
    ),
    [ClonePiece.ScenarioFeaturesData]: ClonePieceRelativePathResolver.scenarioPieceRelativePathResolver(
      scenarioFeaturesDataRelativePath,
    ),
    [ClonePiece.ScenarioRunResults]: ClonePieceRelativePathResolver.scenarioPieceRelativePathResolver(
      scenarioRunResultsRelativePath,
    ),
    [ClonePiece.ScenarioInputFolder]: ClonePieceRelativePathResolver.marxanDataScenarioPieceRelativePathResolver(
      scenarioInputFolderRelativePath,
    ),
    [ClonePiece.ScenarioOutputFolder]: ClonePieceRelativePathResolver.marxanDataScenarioPieceRelativePathResolver(
      scenarioOutputFolderRelativePath,
    ),
    [ClonePiece.MarxanExecutionMetadata]: ClonePieceRelativePathResolver.scenarioPieceRelativePathResolver(
      marxanExecutionMetadataRelativePath,
    ),
  };

  static scenarioPieceRelativePathResolver(
    relativePath: string,
  ): RelativePathResolver {
    return (extraData) => {
      if (!extraData)
        throw new Error(
          'It is not possible generate scenario pieces relative paths without export kind or old scenario id',
        );

      return extraData.kind === ResourceKind.Project
        ? `scenarios/${extraData.scenarioId}/${relativePath}`
        : relativePath;
    };
  }

  static marxanDataProjectPieceRelativePathResolver(
    relativePath: string,
  ): RelativePathResolver {
    return () => {
      return `marxan-data/${relativePath}`;
    };
  }

  static marxanDataScenarioPieceRelativePathResolver(
    relativePath: string,
  ): RelativePathResolver {
    return (extraData) => {
      if (!extraData)
        throw new Error(
          'It is not possible generate marxan data scenario pieces relative paths without export kind or old scenario id',
        );

      const { kind, scenarioId, scenarioName } = extraData;

      if (kind === ResourceKind.Project && !isDefined(scenarioName)) {
        throw new Error(
          'It is not possible generate marxan data scenario pieces relative paths for project exports without scenario name',
        );
      }

      const slugService = new SlugService();

      const scenarioFolder = slugService.stringToSlug(
        `${scenarioName}-${scenarioId}`,
      );

      return extraData.kind === ResourceKind.Project
        ? `marxan-data/${scenarioFolder}/${relativePath}`
        : `marxan-data/${relativePath}`;
    };
  }

  static resolveFor(
    clonePiece: ClonePiece,
    extraData?: RelativePathResolverExtraData,
  ): string {
    return this.clonePieceRelativePaths[clonePiece](extraData);
  }
}
