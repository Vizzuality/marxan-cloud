import { isDefined } from '../../../../utils/src';
import { SlugService } from '../../../../utils/src/slug.service';
import { ComponentLocation, ResourceKind } from '../../domain';
import { ClonePiece } from '../../domain/clone-piece';
import { exportConfigRelativePath } from './export-config';
import { featuresSpecificationRelativePath } from './features-specification';
import { planningAreaCustomRelativePath } from './planning-area-custom';
import { planningAreaCustomGeoJSONRelativePath } from './planning-area-custom-geojson';
import { planningAreaGadmRelativePath } from './planning-area-gadm';
import { planningUnitsGridRelativePath } from './planning-units-grid';
import { planningUnitsGridGeoJSONRelativePath } from './planning-units-grid-geojson';
import { projectCustomFeaturesRelativePath } from './project-custom-features';
import { projectCustomProtectedAreasRelativePath } from './project-custom-protected-areas';
import { projectMetadataRelativePath } from './project-metadata';
import { scenarioFeaturesDataRelativePath } from './scenario-features-data';
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

type UriResolverExtraData = {
  kind: ResourceKind;
  scenarioId: string;
  scenarioName?: string;
};

type UriResolver = (
  location: string,
  extraData?: UriResolverExtraData,
) => ComponentLocation[];

function scenarioPieceUriResolver(relativePath: string): UriResolver {
  return (location, extraData) => {
    if (!extraData)
      throw new Error(
        'It is not possible generate scenario pieces uris without export kind or old scenario id',
      );

    return [
      new ComponentLocation(
        location,
        extraData.kind === ResourceKind.Project
          ? `scenarios/${extraData.scenarioId}/${relativePath}`
          : relativePath,
      ),
    ];
  };
}

function marxanDataProjectPieceUriResolver(relativePath: string): UriResolver {
  return (location) => {
    return [new ComponentLocation(location, `marxan-data/${relativePath}`)];
  };
}

function marxanDataScenarioPieceUriResolver(relativePath: string): UriResolver {
  return (location, extraData) => {
    if (!extraData)
      throw new Error(
        'It is not possible generate marxan data scenario pieces uris without export kind or old scenario id',
      );

    const { kind, scenarioId, scenarioName } = extraData;

    if (kind === ResourceKind.Project && !isDefined(scenarioName)) {
      throw new Error(
        'It is not possible generate marxan data scenario pieces uris for project exports without scenario name',
      );
    }

    const slugService = new SlugService();

    const scenarioFolder = slugService.stringToSlug(
      `${scenarioName}-${scenarioId}`,
    );

    return [
      new ComponentLocation(
        location,
        extraData.kind === ResourceKind.Project
          ? `marxan-data/${scenarioFolder}/${relativePath}`
          : `marxan-data/${relativePath}`,
      ),
    ];
  };
}

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
  [ClonePiece.ProjectCustomFeatures]: 1,
  //
  [ClonePiece.ScenarioProtectedAreas]: 2,
  [ClonePiece.ScenarioPlanningUnitsData]: 2,
  [ClonePiece.ScenarioFeaturesData]: 2,
  //
  [ClonePiece.ScenarioRunResults]: 3,
  // Temporal import order
  [ClonePiece.FeaturesSpecification]: 10,
};

export class ClonePieceUrisResolver {
  private static clonePieceUris: Record<ClonePiece, UriResolver> = {
    [ClonePiece.ExportConfig]: (location) => [
      new ComponentLocation(location, exportConfigRelativePath),
    ],
    [ClonePiece.PlanningAreaGAdm]: (location) => [
      new ComponentLocation(location, planningAreaGadmRelativePath),
    ],
    [ClonePiece.PlanningAreaCustom]: (location) => [
      new ComponentLocation(location, planningAreaCustomRelativePath),
    ],
    [ClonePiece.PlanningAreaCustomGeojson]: marxanDataProjectPieceUriResolver(
      planningAreaCustomGeoJSONRelativePath,
    ),

    [ClonePiece.PlanningUnitsGrid]: (location) => [
      new ComponentLocation(location, planningUnitsGridRelativePath),
    ],
    [ClonePiece.PlanningUnitsGridGeojson]: marxanDataProjectPieceUriResolver(
      planningUnitsGridGeoJSONRelativePath,
    ),
    [ClonePiece.ProjectMetadata]: (location) => [
      new ComponentLocation(location, projectMetadataRelativePath),
    ],
    [ClonePiece.ProjectCustomProtectedAreas]: (location) => [
      new ComponentLocation(location, projectCustomProtectedAreasRelativePath),
    ],
    [ClonePiece.ProjectCustomFeatures]: (location) => [
      new ComponentLocation(location, projectCustomFeaturesRelativePath),
    ],
    [ClonePiece.FeaturesSpecification]: (location) => [
      new ComponentLocation(location, featuresSpecificationRelativePath),
    ],
    [ClonePiece.ScenarioMetadata]: scenarioPieceUriResolver(
      scenarioMetadataRelativePath,
    ),
    [ClonePiece.ScenarioPlanningUnitsData]: scenarioPieceUriResolver(
      scenarioPlanningUnitsDataRelativePath,
    ),
    [ClonePiece.ScenarioProtectedAreas]: scenarioPieceUriResolver(
      scenarioProtectedAreasRelativePath,
    ),
    [ClonePiece.ScenarioFeaturesData]: scenarioPieceUriResolver(
      scenarioFeaturesDataRelativePath,
    ),
    [ClonePiece.ScenarioRunResults]: scenarioPieceUriResolver(
      scenarioRunResultsRelativePath,
    ),
    [ClonePiece.ScenarioInputFolder]: marxanDataScenarioPieceUriResolver(
      scenarioInputFolderRelativePath,
    ),
    [ClonePiece.ScenarioOutputFolder]: marxanDataScenarioPieceUriResolver(
      scenarioOutputFolderRelativePath,
    ),
  };

  static resolveFor(
    clonePiece: ClonePiece,
    location: string,
    extraData?: UriResolverExtraData,
  ): ComponentLocation[] {
    return this.clonePieceUris[clonePiece](location, extraData);
  }
}
